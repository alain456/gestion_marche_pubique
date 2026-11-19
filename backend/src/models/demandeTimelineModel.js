const db = require('../config/db');

const GLOBAL_ROLES = ['ADMIN', 'RAF', 'CGMP'];
const SERVICELESS_ROLES = ['RECEPTIONISTE', 'RECEPTIONNISTE'];

const normalizeText = (value) => (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hasAnyPermission = (permissions, ...codes) =>
    codes.some(code => permissions.includes(code));

const eventFor = (history, predicate) => history.find(item =>
    predicate(normalizeText(`${item.action || ''} ${item.nouveauStatut || ''}`))
);

const makeStep = (key, label, event, current = false, status = 'pending') => ({
    key,
    label,
    status,
    current,
    date: event?.date || null,
    responsible: event?.responsible || null,
    detail: event?.detail || null
});

const buildTimeline = ({ demande, history, marches, receptions, paiements }) => {
    const requestStatus = normalizeText(demande.statut);
    const isRejected = requestStatus.includes('rejet');
    const draftEvent = eventFor(history, text => text.includes('brouillon'));
    const submitEvent = eventFor(history, text =>
        text.includes('soumission') || text.includes('soumis')
    );
    const validationEvent = eventFor(history, text =>
        text.includes('validation budgetaire') || text.includes('budget valide') ||
        text.includes('rejet de la demande') || text.includes('demande rejetee') ||
        text.includes('nouveau statut valide') || text.includes('nouveau statut rejete')
    );
    const marketEvent = eventFor(history, text => text.includes('creation du marche'));
    const requestWasSubmitted = requestStatus !== 'brouillon' || Boolean(submitEvent);
    const budgetWasProcessed = requestStatus === 'valide' ||
        requestStatus.includes('inclus dans marche') || isRejected || Boolean(validationEvent);
    const market = marches.at(-1);
    const reception = receptions.at(-1);
    const payment = paiements.at(-1);

    const steps = [
        makeStep('draft', 'Brouillon', {
            date: draftEvent?.dateAction || demande.dateDemande,
            responsible: draftEvent?.nomUtilisateur || demande.nomDemandeur
        }, !requestWasSubmitted && !isRejected, draftEvent || !requestWasSubmitted ? 'completed' : 'skipped'),
        makeStep('submitted', 'Soumise', submitEvent ? {
            date: submitEvent.dateAction,
            responsible: submitEvent.nomUtilisateur,
            detail: submitEvent.motif
        } : requestWasSubmitted ? {
            date: demande.dateDemande,
            responsible: demande.nomDemandeur
        } : null, requestWasSubmitted && !budgetWasProcessed,
        requestWasSubmitted ? 'completed' : 'pending'),
        makeStep('budget', 'Validation budgétaire', validationEvent ? {
            date: validationEvent.dateAction || demande.dateValidation,
            responsible: validationEvent.nomUtilisateur || demande.responsableFinancier,
            detail: validationEvent.motif
        } : budgetWasProcessed ? {
            date: demande.dateValidation,
            responsible: demande.responsableFinancier
        } : null, isRejected || (budgetWasProcessed && !market),
        isRejected ? 'rejected' : budgetWasProcessed ? 'completed' : 'pending'),
        makeStep('market', 'Marché', market ? {
            date: market.dateSelection || marketEvent?.dateAction,
            responsible: market.validateur || marketEvent?.nomUtilisateur,
            detail: `Marché #${market.idMarche}${market.statut ? ` · ${market.statut}` : ''}`
        } : null, Boolean(market && !reception), market ? 'completed' : 'pending'),
        makeStep('reception', 'Réception', reception ? {
            date: reception.dateReception,
            responsible: reception.responsable,
            detail: [reception.typeReception, reception.conformite, reception.etat].filter(Boolean).join(' · ')
        } : null, Boolean(reception && !payment), reception ? 'completed' : 'pending'),
        makeStep('payment', 'Paiement', payment ? {
            date: payment.datePaiement,
            responsible: payment.responsable,
            detail: payment.montant !== null ? `${Number(payment.montant).toLocaleString('fr-FR')} FBU` : null
        } : null, Boolean(payment), payment ? 'completed' : 'pending')
    ];

    const firstPending = isRejected ? null : steps.find(step => step.status === 'pending');
    if (firstPending) firstPending.current = true;

    return steps;
};

const getTimeline = async (idDemande, user) => {
    const role = (user.role || '').toUpperCase();
    const permissions = user.permissions || [];
    const canViewAll = GLOBAL_ROLES.includes(role) ||
        hasAnyPermission(permissions, 'VOIR_TOUTES_DEMANDES', 'DEMANDE_READ_ALL');

    let accessCondition;
    const params = [idDemande];
    if (canViewAll) {
        accessCondition = '1 = 1';
    } else if (user.idService && !SERVICELESS_ROLES.includes(role) &&
        hasAnyPermission(permissions, 'VOIR_MES_DEMANDES', 'DEMANDE_READ_OWN', 'VOIR_STATISTIQUES')) {
        accessCondition = '(d.idUser = ? OR d.idService = ?)';
        params.push(user.idUser, user.idService);
    } else {
        accessCondition = 'd.idUser = ?';
        params.push(user.idUser);
    }

    const [demandeRows] = await db.query(`
        SELECT d.idDemande, d.dateDemande, d.statut, d.dateValidation,
               d.responsableFinancier, d.idUser, u.nom AS nomDemandeur
        FROM demande d
        LEFT JOIN utilisateur u ON u.idUser = d.idUser
        WHERE d.idDemande = ? AND ${accessCondition}
        LIMIT 1
    `, params);
    if (demandeRows.length === 0) return null;

    const demande = demandeRows[0];
    const [history] = await db.query(`
        SELECT action, nouveauStatut, nomUtilisateur, roleUtilisateur, motif, dateAction
        FROM historique_demande
        WHERE idDemande = ?
        ORDER BY dateAction ASC, idHistorique ASC
    `, [idDemande]);
    const [marches] = await db.query(`
        SELECT idMarche, dateSelection, validateur, statut
        FROM marche
        WHERE FIND_IN_SET(CAST(? AS CHAR), REPLACE(idDemande, ' ', '')) > 0
        ORDER BY dateSelection ASC, idMarche ASC
    `, [idDemande]);
    const marcheIds = marches.map(marche => marche.idMarche);

    let receptions = [];
    let paiements = [];
    if (marcheIds.length > 0) {
        const [receptionRows] = await db.query(`
            SELECT r.idReception, r.dateReception, r.typeReception, r.conformite, r.etat, r.responsable
            FROM reception r
            JOIN contrat c ON c.idContrat = r.idContrat
            WHERE c.idMarche IN (?)
            ORDER BY r.dateReception ASC, r.idReception ASC
        `, [marcheIds]);
        receptions = receptionRows;

        const [paymentRows] = await db.query(`
            SELECT p.idPaiement, p.datePaiement, p.montant, p.responsable
            FROM paiement p
            JOIN reception r ON r.idReception = p.idReception
            JOIN contrat c ON c.idContrat = r.idContrat
            WHERE c.idMarche IN (?)
            ORDER BY p.datePaiement ASC, p.idPaiement ASC
        `, [marcheIds]);
        paiements = paymentRows;
    }

    return buildTimeline({ demande, history, marches, receptions, paiements });
};

module.exports = { getTimeline };

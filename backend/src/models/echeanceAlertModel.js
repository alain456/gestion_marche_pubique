const db = require('../config/db');

const DEFAULT_THRESHOLDS = {
    demandeValidationJours: 5,
    marcheEcheanceJours: 3,
    paiementJours: 5
};

let tableReady;

const ensureTable = async () => {
    if (!tableReady) {
        tableReady = (async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS alerte_echeance_config (
                    cle VARCHAR(50) NOT NULL PRIMARY KEY,
                    jours INT UNSIGNED NOT NULL,
                    modifieLe TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            for (const [cle, jours] of Object.entries(DEFAULT_THRESHOLDS)) {
                await db.query(
                    'INSERT IGNORE INTO alerte_echeance_config (cle, jours) VALUES (?, ?)',
                    [cle, jours]
                );
            }
        })().catch(error => {
            tableReady = null;
            throw error;
        });
    }
    return tableReady;
};

const getThresholds = async () => {
    await ensureTable();
    const [rows] = await db.query('SELECT cle, jours FROM alerte_echeance_config');
    return rows.reduce((thresholds, row) => ({
        ...thresholds,
        [row.cle]: Number(row.jours)
    }), { ...DEFAULT_THRESHOLDS });
};

const updateThresholds = async (thresholds) => {
    await ensureTable();
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const [cle, jours] of Object.entries(thresholds)) {
            await connection.query(
                `INSERT INTO alerte_echeance_config (cle, jours)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE jours = VALUES(jours)`,
                [cle, jours]
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return getThresholds();
};

const getAlerts = async ({ user, permissions, thresholds }) => {
    const alerts = [];
    const normalizedRole = (user.role || '').toUpperCase().replace(/\s+/g, '_');
    const isAdmin = normalizedRole === 'ADMIN';
    const canReadAllDemands = isAdmin ||
        ['RAF', 'CGMP'].includes(normalizedRole) ||
        permissions.includes('VOIR_TOUTES_DEMANDES') ||
        permissions.includes('DEMANDE_READ_ALL');
    const canReadOwnDemands = permissions.includes('VOIR_MES_DEMANDES') ||
        permissions.includes('DEMANDE_READ_OWN');
    const canReadMarkets = isAdmin ||
        permissions.includes('VOIR_MARCHES') ||
        permissions.includes('GERER_MARCHES');
    const canReadPayments = isAdmin ||
        permissions.includes('EFFECTUER_PAIEMENT') ||
        permissions.includes('VOIR_PAIEMENTS');

    if (canReadAllDemands || canReadOwnDemands) {
        const conditions = [
            "d.statut IN ('En attente', 'Soumis')",
            'DATEDIFF(CURDATE(), DATE(d.dateDemande)) >= ?'
        ];
        const params = [thresholds.demandeValidationJours];
        if (!canReadAllDemands) {
            if (user.idService) {
                conditions.push('(d.idUser = ? OR d.idService = ?)');
                params.push(user.idUser, user.idService);
            } else {
                conditions.push('d.idUser = ?');
                params.push(user.idUser);
            }
        }

        const [rows] = await db.query(`
            SELECT d.idDemande, d.statut, d.dateDemande, d.priorite,
                   d.idService, s.nomService, u.nom AS nomDemandeur,
                   DATEDIFF(CURDATE(), DATE(d.dateDemande)) AS joursAttente
            FROM demande d
            LEFT JOIN servicedemandeur s ON s.idService = d.idService
            LEFT JOIN utilisateur u ON u.idUser = d.idUser
            WHERE ${conditions.join(' AND ')}
            ORDER BY d.dateDemande ASC
            LIMIT 50
        `, params);

        for (const row of rows) {
            alerts.push({
                id: `demande-${row.idDemande}`,
                type: 'demande',
                severity: Number(row.joursAttente) >= thresholds.demandeValidationJours * 2 ? 'urgent' : 'warning',
                title: `Demande #${row.idDemande} en attente`,
                detail: `${row.joursAttente} jour(s) · ${row.nomService || row.nomDemandeur || 'Service non précisé'} · ${row.statut}`,
                date: row.dateDemande,
                reference: row.idDemande,
                days: Number(row.joursAttente)
            });
        }
    }

    if (canReadMarkets) {
        const [rows] = await db.query(`
            SELECT m.idMarche, m.dateLimite, m.statut,
                   DATEDIFF(DATE(m.dateLimite), CURDATE()) AS joursRestants
            FROM marche m
            WHERE m.statut = 'publie'
              AND m.dateLimite IS NOT NULL
              AND DATEDIFF(DATE(m.dateLimite), CURDATE()) <= ?
            ORDER BY m.dateLimite ASC
            LIMIT 50
        `, [thresholds.marcheEcheanceJours]);

        for (const row of rows) {
            const days = Number(row.joursRestants);
            alerts.push({
                id: `marche-${row.idMarche}`,
                type: 'marche',
                severity: days < 0 ? 'urgent' : days === 0 ? 'urgent' : 'warning',
                title: days < 0
                    ? `Marché #${row.idMarche} — date limite dépassée`
                    : `Marché #${row.idMarche} — échéance proche`,
                detail: days < 0
                    ? `Échéance dépassée de ${Math.abs(days)} jour(s)`
                    : days === 0 ? 'Échéance aujourd’hui' : `Échéance dans ${days} jour(s)`,
                date: row.dateLimite,
                reference: row.idMarche,
                days
            });
        }
    }

    if (canReadPayments) {
        const [rows] = await db.query(`
            SELECT r.idReception, r.dateReception, c.idContrat,
                   c.titulaireMarche, c.montant,
                   DATEDIFF(CURDATE(), r.dateReception) AS joursAttente
            FROM reception r
            INNER JOIN contrat c ON c.idContrat = r.idContrat
            LEFT JOIN paiement p ON p.idReception = r.idReception
            WHERE p.idPaiement IS NULL
            ORDER BY r.dateReception ASC
            LIMIT 50
        `);

        for (const row of rows) {
            const days = Number(row.joursAttente || 0);
            const overdue = days >= thresholds.paiementJours;
            alerts.push({
                id: `paiement-${row.idReception}`,
                type: 'paiement',
                severity: overdue ? 'urgent' : 'info',
                title: overdue
                    ? `Paiement en retard — réception #${row.idReception}`
                    : `Paiement à traiter — réception #${row.idReception}`,
                detail: `${days} jour(s) depuis la réception${row.titulaireMarche ? ` · ${row.titulaireMarche}` : ''}`,
                date: row.dateReception,
                reference: row.idReception,
                days
            });
        }
    }

    const severityOrder = { urgent: 0, warning: 1, info: 2 };
    alerts.sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity] ||
        new Date(a.date || 0) - new Date(b.date || 0)
    );
    return alerts;
};

module.exports = {
    DEFAULT_THRESHOLDS,
    getThresholds,
    updateThresholds,
    getAlerts
};

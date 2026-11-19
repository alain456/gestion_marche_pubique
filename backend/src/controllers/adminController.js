const db = require('../config/db');

const DEMANDE_STATUSES = [
    'Brouillon',
    'Soumis',
    'En attente',
    'Valide',
    'Rejete',
    'Inclus dans Marché'
];

exports.getStats = async (req, res) => {
    try {
        // Récupère le nombre total d'utilisateurs
        const [usersResult] = await db.query('SELECT COUNT(*) as total FROM utilisateur');
        
        // Récupère le nombre de rôles distincts (ex: ADMIN, CGMP, RAF)
        const [rolesResult] = await db.query('SELECT COUNT(DISTINCT role) as total FROM utilisateur');

        res.json({
            totalUsers: usersResult[0].total,
            activeRoles: rolesResult[0].total
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des stats admin:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques." });
    }
};

exports.getDashboardMetrics = async (req, res) => {
    const { role, idService, idUser, permissions = [] } = req.user;
    const normalizedRole = (role || '').toUpperCase().replace(/\s+/g, '_');
    const hasGlobalDemandAccess = permissions.includes('VOIR_TOUTES_DEMANDES') ||
        permissions.includes('DEMANDE_READ_ALL');
    const canChooseAnyService = ['ADMIN', 'RAF', 'CGMP', 'CHEF_INSTITUTION'].includes(normalizedRole) ||
        hasGlobalDemandAccess;

    const rawYear = req.query.annee;
    const rawService = req.query.service;
    const rawStatus = req.query.statut;
    const year = rawYear && rawYear !== 'tous' ? Number(rawYear) : null;
    const requestedService = rawService && rawService !== 'tous' ? Number(rawService) : null;
    const status = rawStatus && rawStatus !== 'tous' ? rawStatus : null;

    if (year !== null && (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 5)) {
        return res.status(400).json({ message: 'Année invalide.' });
    }
    if (requestedService !== null && (!Number.isInteger(requestedService) || requestedService < 1)) {
        return res.status(400).json({ message: 'Service invalide.' });
    }
    if (status && !DEMANDE_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Statut de demande invalide.' });
    }

    const selectedService = canChooseAnyService ? requestedService : idService;
    const demandConditions = [];
    const demandParams = [];

    if (selectedService) {
        demandConditions.push('d.idService = ?');
        demandParams.push(selectedService);
    } else if (!canChooseAnyService) {
        demandConditions.push('d.idUser = ?');
        demandParams.push(idUser);
    }
    if (year !== null) {
        demandConditions.push('YEAR(d.dateDemande) = ?');
        demandParams.push(year);
    }
    if (status) {
        demandConditions.push('d.statut = ?');
        demandParams.push(status);
    }

    const demandWhere = demandConditions.length ? `WHERE ${demandConditions.join(' AND ')}` : '';
    const marketConditions = [];
    const marketParams = [];
    if (selectedService) {
        marketConditions.push('d.idService = ?');
        marketParams.push(selectedService);
    } else if (!canChooseAnyService) {
        marketConditions.push('d.idUser = ?');
        marketParams.push(idUser);
    }
    if (year !== null) {
        marketConditions.push('YEAR(m.dateSelection) = ?');
        marketParams.push(year);
    }
    if (status) {
        marketConditions.push('d.statut = ?');
        marketParams.push(status);
    }
    const marketWhere = marketConditions.length ? `WHERE ${marketConditions.join(' AND ')}` : '';

    try {
        const [summaryRows] = await db.query(`
            SELECT
                COUNT(*) AS totalDemandes,
                SUM(CASE WHEN d.statut IN ('En attente', 'Soumis') THEN 1 ELSE 0 END) AS demandesEnAttente,
                COALESCE(AVG(
                    CASE
                        WHEN d.dateValidation IS NOT NULL AND d.dateValidation >= d.dateDemande
                        THEN DATEDIFF(d.dateValidation, d.dateDemande)
                    END
                ), 0) AS delaiMoyenJours,
                COALESCE(SUM(
                    CASE WHEN d.statut IN ('Valide', 'Inclus dans Marché')
                    THEN d.montantEstime ELSE 0 END
                ), 0) AS budgetEngage
            FROM demande d
            ${demandWhere}
        `, demandParams);

        const [demandeStatusRows] = await db.query(`
            SELECT d.statut AS statut, COUNT(*) AS total
            FROM demande d
            ${demandWhere}
            GROUP BY d.statut
            ORDER BY total DESC, d.statut
        `, demandParams);

        const [marketStatusRows] = await db.query(`
            SELECT m.statut AS statut, COUNT(DISTINCT m.idMarche) AS total
            FROM marche m
            INNER JOIN demande d ON FIND_IN_SET(d.idDemande, m.idDemande) > 0
            ${marketWhere}
            GROUP BY m.statut
            ORDER BY total DESC, m.statut
        `, marketParams);

        const serviceConditions = canChooseAnyService ? '' : 'WHERE idService = ?';
        const serviceParams = canChooseAnyService ? [] : [selectedService];
        const [services] = await db.query(`
            SELECT idService, nomService
            FROM servicedemandeur
            ${serviceConditions}
            ORDER BY nomService
        `, serviceParams);

        res.json({
            summary: summaryRows[0],
            demandeStatuses: demandeStatusRows,
            marketStatuses: marketStatusRows,
            services,
            canChooseAnyService,
            filters: {
                annee: year,
                service: selectedService,
                statut: status
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des indicateurs du tableau de bord:', error);
        res.status(500).json({ message: 'Erreur serveur lors du chargement des indicateurs.' });
    }
};
const AuditLog = require('../models/auditLogModel');

const isValidDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const getAuditPage = async (req, res, scopedUserId = null) => {
    const { from = '', to = '', entity = '', method = '', search = '' } = req.query;
    const userId = scopedUserId === null ? req.query.userId || '' : scopedUserId;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);

    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
        return res.status(400).json({ message: 'Format de date invalide. Utilisez AAAA-MM-JJ.' });
    }
    if (from && to && from > to) {
        return res.status(400).json({ message: 'La date de début doit précéder la date de fin.' });
    }
    if (userId && (!/^\d+$/.test(String(userId)) || Number(userId) < 1)) {
        return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
    }
    if (entity && ![
        'demandes', 'marches', 'budgets', 'users', 'roles', 'permissions',
        'services', 'articles', 'contrats', 'receptions', 'paiements',
        'soumissions', 'attachments', 'admin', 'api', 'seuils',
        'parametres', 'notifications'
    ].includes(entity)) {
        return res.status(400).json({ message: 'Type d’entité invalide.' });
    }
    if (method && !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return res.status(400).json({ message: 'Méthode invalide.' });
    }
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ message: 'Pagination invalide.' });
    }

    try {
        const result = await AuditLog.findPage({
            from: from || null,
            to: to || null,
            userId: userId ? Number(userId) : null,
            entity: entity || null,
            method: method || null,
            search: String(search).trim().slice(0, 100) || null,
            limit,
            offset: (page - 1) * limit
        });
        res.json({
            entries: result.entries,
            pagination: {
                page,
                limit,
                total: Number(result.total),
                totalPages: Math.ceil(Number(result.total) / limit)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la lecture du journal d’audit:', error);
        res.status(500).json({ message: 'Impossible de charger le journal d’audit.' });
    }
};

exports.getAuditLog = (req, res) => getAuditPage(req, res);

exports.getMyAuditLog = (req, res) => getAuditPage(req, res, req.user.idUser);

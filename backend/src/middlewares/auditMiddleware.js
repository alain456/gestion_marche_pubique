const AuditLog = require('../models/auditLogModel');

const entityNames = new Set([
    'demandes', 'marches', 'budgets', 'users', 'roles', 'permissions',
    'services', 'articles', 'contrats', 'receptions', 'paiements',
    'soumissions', 'attachments', 'admin', 'seuils', 'parametres',
    'notifications'
]);
const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const maxEntityId = 2147483647;

const auditMiddleware = (req, res, next) => {
    if (!req.path.startsWith('/api/') || !mutatingMethods.has(req.method)) {
        return next();
    }

    res.once('finish', () => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !req.user?.idUser) return;

        const segments = req.path.split('/').filter(Boolean);
        const entity = entityNames.has(segments[1]) ? segments[1] : 'api';
        const possibleId = segments[2];
        const entry = {
            idUtilisateur: req.user.idUser,
            nomUtilisateur: (req.user.nom || 'Utilisateur').slice(0, 100),
            roleUtilisateur: (req.user.role || 'INCONNU').slice(0, 50),
            methode: req.method,
            entite: entity,
            idEntite: /^\d+$/.test(possibleId || '') &&
                Number.isSafeInteger(Number(possibleId)) &&
                Number(possibleId) <= maxEntityId
                ? Number(possibleId)
                : null,
            route: req.path.slice(0, 255),
            codeHttp: res.statusCode,
            adresseIp: req.ip || null,
            agentUtilisateur: (req.get('user-agent') || '').slice(0, 255) || null
        };

        AuditLog.record(entry).catch(error => {
            console.error('Échec de l’écriture du journal d’audit:', error);
        });
    });

    next();
};

module.exports = auditMiddleware;

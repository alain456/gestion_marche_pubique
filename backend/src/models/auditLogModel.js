const db = require('../config/db');

const AuditLog = {
    record: async (entry) => {
        await db.query(
            `INSERT INTO journal_audit
                (idUtilisateur, nomUtilisateur, roleUtilisateur, methode, entite,
                 idEntite, route, codeHttp, adresseIp, agentUtilisateur)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                entry.idUtilisateur,
                entry.nomUtilisateur,
                entry.roleUtilisateur,
                entry.methode,
                entry.entite,
                entry.idEntite,
                entry.route,
                entry.codeHttp,
                entry.adresseIp,
                entry.agentUtilisateur
            ]
        );
    },

    findPage: async ({ from, to, userId, entity, method, search, limit, offset }) => {
        const conditions = [];
        const params = [];
        if (from) {
            conditions.push('dateAction >= ?');
            params.push(`${from} 00:00:00`);
        }
        if (to) {
            conditions.push('dateAction < DATE_ADD(?, INTERVAL 1 DAY)');
            params.push(`${to} 00:00:00`);
        }
        if (userId) {
            conditions.push('idUtilisateur = ?');
            params.push(userId);
        }
        if (entity) {
            conditions.push('entite = ?');
            params.push(entity);
        }
        if (method) {
            conditions.push('methode = ?');
            params.push(method);
        }
        if (search) {
            conditions.push('(nomUtilisateur LIKE ? OR route LIKE ? OR roleUtilisateur LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [[countRow], [entries]] = await Promise.all([
            db.query(`SELECT COUNT(*) AS total FROM journal_audit ${where}`, params),
            db.query(
                `SELECT idAudit, idUtilisateur, nomUtilisateur, roleUtilisateur, methode,
                        entite, idEntite, route, codeHttp, adresseIp, agentUtilisateur, dateAction
                 FROM journal_audit
                 ${where}
                 ORDER BY dateAction DESC, idAudit DESC
                 LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            )
        ]);
        return { entries, total: countRow[0]?.total || 0 };
    }
};

module.exports = AuditLog;

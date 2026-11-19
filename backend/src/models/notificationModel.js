const db = require('../config/db');

let readTableReady;

const ensureReadTable = async () => {
    if (!readTableReady) {
        readTableReady = db.query(`
            CREATE TABLE IF NOT EXISTS notification_lue (
                idUser INT NOT NULL,
                idHistorique INT NOT NULL,
                dateLecture TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (idUser, idHistorique),
                KEY notification_lue_historique_idx (idHistorique),
                CONSTRAINT notification_lue_user_fk
                    FOREIGN KEY (idUser) REFERENCES utilisateur(idUser) ON DELETE CASCADE,
                CONSTRAINT notification_lue_historique_fk
                    FOREIGN KEY (idHistorique) REFERENCES historique_demande(idHistorique) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `).catch(error => {
            readTableReady = null;
            throw error;
        });
    }

    await readTableReady;
};

const Notification = {
    findForUser: async (user, limit = 30) => {
        await ensureReadTable();
        const conditions = ['(h.idUtilisateur IS NULL OR h.idUtilisateur <> ?)', 'h.dateAction >= DATE_SUB(NOW(), INTERVAL 30 DAY)'];
        const params = [user.idUser];
        const role = (user.role || '').toUpperCase();
        const permissions = user.permissions || [];
        const canViewAll = ['ADMIN', 'RAF', 'CGMP'].includes(role) ||
            permissions.includes('VOIR_TOUTES_DEMANDES') ||
            permissions.includes('DEMANDE_READ_ALL');

        if (!canViewAll && user.idService && !['RECEPTIONISTE', 'RECEPTIONNISTE'].includes(role)) {
            conditions.push('(d.idUser = ? OR d.idService = ?)');
            params.push(user.idUser, user.idService);
        } else if (!canViewAll) {
            conditions.push('d.idUser = ?');
            params.push(user.idUser);
        }

        const whereClause = conditions.join(' AND ');
        const [items] = await db.query(`
            SELECT
                h.idHistorique,
                h.idDemande,
                h.action,
                h.nouveauStatut,
                h.nomUtilisateur,
                h.roleUtilisateur,
                h.dateAction,
                l.idHistorique IS NOT NULL AS lu
            FROM historique_demande h
            JOIN demande d ON d.idDemande = h.idDemande
            LEFT JOIN notification_lue l
                ON l.idHistorique = h.idHistorique AND l.idUser = ?
            WHERE ${whereClause}
            ORDER BY h.dateAction DESC, h.idHistorique DESC
            LIMIT ?
        `, [user.idUser, ...params, limit]);

        const [countRows] = await db.query(`
            SELECT COUNT(*) AS unreadCount
            FROM historique_demande h
            JOIN demande d ON d.idDemande = h.idDemande
            LEFT JOIN notification_lue l
                ON l.idHistorique = h.idHistorique AND l.idUser = ?
            WHERE ${whereClause} AND l.idHistorique IS NULL
        `, [user.idUser, ...params]);

        return {
            items: items.map(item => ({ ...item, lu: Boolean(item.lu) })),
            unreadCount: Number(countRows[0].unreadCount)
        };
    },

    markAsRead: async (idHistorique, user) => {
        await ensureReadTable();
        const conditions = ['h.idHistorique = ?', '(h.idUtilisateur IS NULL OR h.idUtilisateur <> ?)'];
        const params = [idHistorique, user.idUser];
        const role = (user.role || '').toUpperCase();
        const permissions = user.permissions || [];
        const canViewAll = ['ADMIN', 'RAF', 'CGMP'].includes(role) ||
            permissions.includes('VOIR_TOUTES_DEMANDES') ||
            permissions.includes('DEMANDE_READ_ALL');

        if (!canViewAll && user.idService && !['RECEPTIONISTE', 'RECEPTIONNISTE'].includes(role)) {
            conditions.push('(d.idUser = ? OR d.idService = ?)');
            params.push(user.idUser, user.idService);
        } else if (!canViewAll) {
            conditions.push('d.idUser = ?');
            params.push(user.idUser);
        }

        const [result] = await db.query(`
            INSERT INTO notification_lue (idUser, idHistorique)
            SELECT ?, h.idHistorique
            FROM historique_demande h
            JOIN demande d ON d.idDemande = h.idDemande
            WHERE ${conditions.join(' AND ')}
            ON DUPLICATE KEY UPDATE dateLecture = CURRENT_TIMESTAMP
        `, [user.idUser, ...params]);
        return result.affectedRows > 0;
    },

    markAllAsRead: async (user) => {
        await ensureReadTable();
        const conditions = [
            '(h.idUtilisateur IS NULL OR h.idUtilisateur <> ?)',
            'h.dateAction >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
            'l.idHistorique IS NULL'
        ];
        const params = [user.idUser];
        const role = (user.role || '').toUpperCase();
        const permissions = user.permissions || [];
        const canViewAll = ['ADMIN', 'RAF', 'CGMP'].includes(role) ||
            permissions.includes('VOIR_TOUTES_DEMANDES') ||
            permissions.includes('DEMANDE_READ_ALL');

        if (!canViewAll && user.idService && !['RECEPTIONISTE', 'RECEPTIONNISTE'].includes(role)) {
            conditions.push('(d.idUser = ? OR d.idService = ?)');
            params.push(user.idUser, user.idService);
        } else if (!canViewAll) {
            conditions.push('d.idUser = ?');
            params.push(user.idUser);
        }

        const [result] = await db.query(`
            INSERT INTO notification_lue (idUser, idHistorique)
            SELECT ?, h.idHistorique
            FROM historique_demande h
            JOIN demande d ON d.idDemande = h.idDemande
            LEFT JOIN notification_lue l
                ON l.idHistorique = h.idHistorique AND l.idUser = ?
            WHERE ${conditions.join(' AND ')}
            ON DUPLICATE KEY UPDATE dateLecture = CURRENT_TIMESTAMP
        `, [user.idUser, user.idUser, ...params]);
        return result.affectedRows;
    }
};

module.exports = Notification;

const db = require('../config/db');

const User = {
    // --- Méthodes Utilisateur ---
    create: async (data) => {
        const { nom, email, password, idRole, idService } = data;
        const query = `INSERT INTO utilisateur (nom, email, password, idRole, idService) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [nom, email, password, idRole, idService]);
        return result;
    },

    update: async (idUser, data) => {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        const query = `UPDATE utilisateur SET ${fields} WHERE idUser = ?`;
        const [result] = await db.query(query, [...values, idUser]);
        return result;
    },

    delete: async (idUser) => {
        const [result] = await db.query(`DELETE FROM utilisateur WHERE idUser = ?`, [idUser]);
        return result;
    },

    findAll: async () => {
        const query = `
            SELECT u.*, r.nomRole, s.nomService 
            FROM utilisateur u 
            LEFT JOIN role r ON u.idRole = r.idRole 
            LEFT JOIN servicedemandeur s ON u.idService = s.idService
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    toggleStatus: async (idUser) => {
        // Inverse l'état actuel de est_actif
        const [result] = await db.query(
            `UPDATE utilisateur SET est_actif = NOT est_actif WHERE idUser = ?`,
            [idUser]
        );
        return result;
    },

    findByEmail: async (email) => {
        const query = `
            SELECT u.*, r.nomRole, s.nomService 
            FROM utilisateur u 
            JOIN role r ON u.idRole = r.idRole 
            LEFT JOIN servicedemandeur s ON u.idService = s.idService
            WHERE u.email = ?
        `;
        const [rows] = await db.query(query, [email]);
        return rows[0];
    },

    findById: async (idUser) => {
        const query = `
            SELECT u.idUser, u.nom, u.email, r.nomRole, u.idService, s.nomService
            FROM utilisateur u
            JOIN role r ON u.idRole = r.idRole
            LEFT JOIN servicedemandeur s ON u.idService = s.idService
            WHERE u.idUser = ?
        `;
        const [rows] = await db.query(query, [idUser]);
        return rows[0];
    },

    // --- Méthodes Role ---
    createRole: async (nomRole) => {
        const [result] = await db.query(`INSERT INTO role (nomRole) VALUES (?)`, [nomRole]);
        return result;
    },

    updateRole: async (idRole, nomRole) => {
        const [result] = await db.query(`UPDATE role SET nomRole = ? WHERE idRole = ?`, [nomRole, idRole]);
        return result;
    },

    deleteRole: async (idRole) => {
        const [result] = await db.query(`DELETE FROM role WHERE idRole = ?`, [idRole]);
        return result;
    },

    findAllRoles: async () => {
        const [rows] = await db.query(`SELECT idRole, nomRole FROM role`);
        return rows;
    },

    // --- Méthodes Permissions ---
    // Récupérer toutes les permissions
    findAllPermissions: async () => {
        const [rows] = await db.query(`SELECT * FROM permission ORDER BY codePermission`);
        return rows;
    },

    // Récupérer les permissions d'un rôle
    findPermissionsByRole: async (idRole) => {
        const [rows] = await db.query(`
            SELECT p.* 
            FROM permission p
            JOIN role_permission rp ON p.idPermission = rp.idPermission
            WHERE rp.idRole = ?
        `, [idRole]);
        return rows;
    },

    // Récupérer les permissions individuelles d'un utilisateur
    findPermissionsByUser: async (idUser) => {
        const [rows] = await db.query(`
            SELECT p.* 
            FROM permission p
            JOIN utilisateur_permission up ON p.idPermission = up.idPermission
            WHERE up.idUser = ?
        `, [idUser]);
        return rows;
    },

    // Récupérer toutes les permissions d'un utilisateur (rôle + individuelles)
    findAllPermissionsForUser: async (idUser, idRole) => {
        const [rows] = await db.query(`
            SELECT p.codePermission
            FROM permission p
            JOIN role_permission rp ON p.idPermission = rp.idPermission
            WHERE rp.idRole = ?
              AND NOT EXISTS (
                  SELECT 1
                  FROM utilisateur_permission up
                  WHERE up.idUser = ?
                    AND up.idPermission = p.idPermission
                    AND up.typePermission = 'REVOKE'
              )
            UNION
            SELECT p.codePermission
            FROM permission p
            JOIN utilisateur_permission up ON p.idPermission = up.idPermission
            WHERE up.idUser = ?
              AND up.typePermission = 'GRANT'
        `, [idRole, idUser, idUser]);
        return rows.map(row => row.codePermission);
    },

    // Ajouter une permission individuelle à un utilisateur
    addUserPermission: async (idUser, idPermission) => {
        const [result] = await db.query(
            `INSERT INTO utilisateur_permission (idUser, idPermission) VALUES (?, ?)`,
            [idUser, idPermission]
        );
        return result;
    },

    // Supprimer une permission individuelle d'un utilisateur
    removeUserPermission: async (idUser, idPermission) => {
        const [result] = await db.query(
            `DELETE FROM utilisateur_permission WHERE idUser = ? AND idPermission = ?`,
            [idUser, idPermission]
        );
        return result;
    },

    // Ajouter une permission à un rôle
    addRolePermission: async (idRole, idPermission) => {
        const [result] = await db.query(
            `INSERT INTO role_permission (idRole, idPermission) VALUES (?, ?)`,
            [idRole, idPermission]
        );
        return result;
    },

    // Supprimer une permission d'un rôle
    removeRolePermission: async (idRole, idPermission) => {
        const [result] = await db.query(
            `DELETE FROM role_permission WHERE idRole = ? AND idPermission = ?`,
            [idRole, idPermission]
        );
        return result;
    }
};

module.exports = User;
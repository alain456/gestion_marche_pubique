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
    }
};

module.exports = User;
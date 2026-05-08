const db = require('../config/db');

const Service = {
    // Créer un nouveau service demandeur
    create: async (nomService) => {
        const query = 'INSERT INTO service_demandeur (nomService) VALUES (?)';
        const [result] = await db.query(query, [nomService]);
        return result;
    },

    // Lister tous les services demandeurs
    findAll: async () => {
        const [rows] = await db.query('SELECT idService, nomService FROM service_demandeur');
        return rows;
    },

    // Récupérer un service par son ID
    findById: async (id) => {
        const query = 'SELECT idService, nomService FROM service_demandeur WHERE idService = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // Modifier un service demandeur
    update: async (id, nomService) => {
        const query = 'UPDATE service_demandeur SET nomService = ? WHERE idService = ?';
        const [result] = await db.query(query, [nomService, id]);
        return result;
    },

    // Supprimer un service demandeur
    delete: async (id) => {
        const query = 'DELETE FROM service_demandeur WHERE idService = ?';
        const [result] = await db.query(query, [id]);
        return result;
    }
};

module.exports = Service;
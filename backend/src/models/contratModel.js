const db = require('../config/db');

const Contrat = {
    // Créer un contrat et mettre à jour le statut du marché
    create: async (data) => {
        const { 
            idMarche, titulaireMarche, montant, dateDebut, 
            dateFin, dureeContrat, conditionsContractuelles 
        } = data;

        // 1. Insertion du contrat
        const queryContrat = `
            INSERT INTO contrat (idMarche, titulaireMarche, montant, dateDebut, dateFin, dureeContrat, conditionsContractuelles, statut)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'En attente validation Chef')
        `;
        const [result] = await db.query(queryContrat, [
            idMarche, titulaireMarche, montant, dateDebut, dateFin, dureeContrat, conditionsContractuelles
        ]);

        // 2. Mise à jour du statut du marché
        await db.query("UPDATE marche SET statut = 'Contrat en rédaction' WHERE idMarche = ?", [idMarche]);

        return result;
    },

    // Mettre à jour le statut du contrat
    updateStatus: async (id, statut) => {
        const query = "UPDATE contrat SET statut = ? WHERE idContrat = ?";
        const [result] = await db.query(query, [statut, id]);
        return result;
    },

    // Récupérer tous les contrats
    findAll: async () => {
        const query = `
            SELECT c.*, m.modepassation 
            FROM contrat c 
            JOIN marche m ON c.idMarche = m.idMarche
            ORDER BY c.idContrat DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Récupérer un contrat par ID
    findById: async (id) => {
        const [rows] = await db.query("SELECT * FROM contrat WHERE idContrat = ?", [id]);
        return rows[0];
    }
};

module.exports = Contrat;
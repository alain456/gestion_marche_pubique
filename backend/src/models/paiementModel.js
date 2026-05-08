const db = require('../config/db');

const Paiement = {
    /**
     * Enregistre un paiement et clôture le marché associé.
     * @param {object} data - Les données du paiement (idReception, montant, datePaiement).
     * @returns {Promise<object>} Le résultat de l'insertion.
     */
    create: async (data) => {
        const { idReception, montant, datePaiement } = data;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Enregistrer le paiement
            const queryPaiement = `
                INSERT INTO paiement (idReception, montant, datePaiement) 
                VALUES (?, ?, ?)
            `;
            const [result] = await connection.query(queryPaiement, [idReception, montant, datePaiement]);

            // 2. Mettre à jour le statut du marché à 'cloture' via une jointure
            const queryUpdateMarche = `
                UPDATE marche m
                JOIN contrat c ON m.idMarche = c.idMarche
                JOIN reception r ON c.idContrat = r.idContrat
                SET m.statut = 'cloture'
                WHERE r.idReception = ?
            `;
            await connection.query(queryUpdateMarche, [idReception]);

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Récupère la liste de tous les paiements effectués.
     */
    findAll: async () => {
        const query = `
            SELECT p.*, r.dateReception, c.titulaireMarche 
            FROM paiement p
            JOIN reception r ON p.idReception = r.idReception
            JOIN contrat c ON r.idContrat = c.idContrat
            ORDER BY p.idPaiement DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = Paiement;
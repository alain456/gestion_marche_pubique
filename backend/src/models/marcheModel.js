const db = require('../config/db');

const Marche = {
    // Créer un nouveau marché
    create: async (data) => {
        const { 
            idDemande, numeroBudget, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire, dateLimite
        } = data;

        const query = `INSERT INTO marche (
            idDemande, numeroBudget, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire, dateLimite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(query, [
            idDemande, numeroBudget, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire, dateLimite
        ]);
        return result;
    },

    // Récupérer tous les marchés
    findAll: async () => {
        // NOTE: idDemande est un champ varchar multi-valeurs (ex: "28,27,25")
        // On ne peut pas faire un JOIN direct — on retourne simplement tous les marchés.
        const [rows] = await db.query('SELECT * FROM marche ORDER BY idMarche DESC');
        return rows;
    },

    // Récupérer un marché par ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM marche WHERE idMarche = ?', [id]);
        return rows[0];
    },

    // Récupérer les marchés par statut (utile pour les filtres du dashboard)
    findByStatus: async (statut) => {
        const [rows] = await db.query('SELECT * FROM marche WHERE statut = ? ORDER BY dateSelection DESC', [statut]);
        return rows;
    },

    // Mettre à jour le statut
    updateStatus: async (id, statut) => {
        const query = 'UPDATE marche SET statut = ? WHERE idMarche = ?';
        const [result] = await db.query(query, [statut, id]);
        return result;
    },

    // Mettre à jour un marché (général)
    update: async (id, data) => {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value === '' ? null : value);
            }
        }
        
        if (fields.length === 0) return { affectedRows: 0 };
        
        const query = `UPDATE marche SET ${fields.join(', ')} WHERE idMarche = ?`;
        values.push(id);
        
        const [result] = await db.query(query, values);
        return result;
    },

    // Mettre à jour les informations de clôture
    cloturer: async (id, data) => {
        const { dateCloture, cloturePar, commentaire } = data;
        const query = `
            UPDATE marche 
            SET statut = 'cloture', dateCloture = ?, cloturePar = ?, commentaire = ? 
            WHERE idMarche = ?
        `;
        const [result] = await db.query(query, [dateCloture, cloturePar, commentaire, id]);
        return result;
    },

    // Supprimer un marché
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM marche WHERE idMarche = ?', [id]);
        return result;
    },

    // Mettre à jour les critères d'évaluation
    updateCriteres: async (id, criteresJSON) => {
        const query = 'UPDATE marche SET criteresEvaluation = ? WHERE idMarche = ?';
        const [result] = await db.query(query, [criteresJSON, id]);
        return result;
    }
};

module.exports = Marche;
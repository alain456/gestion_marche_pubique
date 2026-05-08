const db = require('../config/db');

const Marche = {
    // Créer un nouveau marché
    create: async (data) => {
        const { 
            idDemande, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire 
        } = data;

        const query = `INSERT INTO marche (
            idDemande, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(query, [
            idDemande, montantEstime, modePassation, justificationChoix, 
            seuilReglementaireApplique, dateSelection, validateur, 
            statut, dateCloture, cloturePar, commentaire
        ]);
        return result;
    },

    // Récupérer tous les marchés avec infos service
    findAll: async () => {
        const query = `
            SELECT 
                m.*, 
                d.typeMarche, 
                s.nomService,
                u.nom as nomDemandeur,
                r.nomRole as roleDemandeur
            FROM marche m
            LEFT JOIN demande d ON m.idDemande = d.idDemande
            LEFT JOIN servicedemandeur s ON d.idService = s.idService
            LEFT JOIN utilisateur u ON d.idUser = u.idUser
            LEFT JOIN role r ON u.idRole = r.idRole
            ORDER BY m.idMarche DESC
        `;
        const [rows] = await db.query(query);
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
    }
};

module.exports = Marche;
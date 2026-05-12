const db = require('../config/db');

const Soumission = {
    // Enregistrer une nouvelle offre
    create: async (data) => {
        const { 
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            statut, motif
        } = data;

        const query = `INSERT INTO soumissionnaire (
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            statut, motif
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(query, [
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            statut || 'en attente', motif || null
        ]);
        return result;
    },

    // Lister les offres d'un marché spécifique (triées par montant croissant)
    findByMarche: async (idMarche) => {
        const query = `SELECT * FROM soumissionnaire WHERE idMarche = ? ORDER BY montantPropose ASC`;
        const [rows] = await db.query(query, [idMarche]);
        return rows;
    },

    // Lister toutes les offres (pour le réceptionniste)
    findAll: async () => {
        const query = `
            SELECT s.*, m.modePassation, m.idDemande 
            FROM soumissionnaire s
            JOIN marche m ON s.idMarche = m.idMarche
            ORDER BY s.idOffre DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Mettre à jour une offre
    update: async (idOffre, data) => {
        const { 
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            statut, motif 
        } = data;

        const query = `UPDATE soumissionnaire SET 
            idMarche = ?, nomSoumissionnaire = ?, adresse = ?, telephone = ?, 
            email = ?, referenceAppelOffre = ?, dateSoumission = ?, montantPropose = ?,
            statut = ?, motif = ?
            WHERE idOffre = ?`;

        const [result] = await db.query(query, [
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            statut, motif, idOffre
        ]);
        return result;
    },

    // Supprimer une offre
    delete: async (idOffre) => {
        const query = `DELETE FROM soumissionnaire WHERE idOffre = ?`;
        const [result] = await db.query(query, [idOffre]);
        return result;
    }
};

module.exports = Soumission;
const db = require('../config/db');

const Soumission = {
    // Enregistrer une nouvelle offre
    create: async (data) => {
        const { 
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            delaiLivraison, statut, motif
        } = data;

        const query = `INSERT INTO soumissionnaire (
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose,
            delaiLivraison, statut, motif, demandeModification, autorisationModification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`;

        const [result] = await db.query(query, [
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose || null,
            delaiLivraison || null, statut || 'en attente', motif || null
        ]);
        return result;
    },

    // Trouver une offre par ID
    findById: async (idOffre) => {
        const query = `SELECT * FROM soumissionnaire WHERE idOffre = ?`;
        const [rows] = await db.query(query, [idOffre]);
        return rows[0];
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
            delaiLivraison, statut, motif, autorisationModification
        } = data;

        const query = `UPDATE soumissionnaire SET 
            idMarche = ?, nomSoumissionnaire = ?, adresse = ?, telephone = ?, 
            email = ?, referenceAppelOffre = ?, dateSoumission = ?, montantPropose = ?,
            delaiLivraison = ?, statut = ?, motif = ?, autorisationModification = ?
            WHERE idOffre = ?`;

        const [result] = await db.query(query, [
            idMarche, nomSoumissionnaire, adresse, telephone, 
            email, referenceAppelOffre, dateSoumission, montantPropose || null,
            delaiLivraison || null, statut, motif, autorisationModification, idOffre
        ]);
        return result;
    },

    // Demander une modification (par le réceptionniste)
    requestModification: async (idOffre, motifModification) => {
        const query = `UPDATE soumissionnaire SET demandeModification = 1, motifModification = ? WHERE idOffre = ?`;
        const [result] = await db.query(query, [motifModification, idOffre]);
        return result;
    },

    // Autoriser une modification (par le RAF)
    authorizeModification: async (idOffre) => {
        const query = `UPDATE soumissionnaire SET autorisationModification = 1, demandeModification = 0 WHERE idOffre = ?`;
        const [result] = await db.query(query, [idOffre]);
        return result;
    },

    // Réinitialiser les drapeaux de modification après modification
    resetModificationFlags: async (idOffre) => {
        const query = `UPDATE soumissionnaire SET autorisationModification = 0, demandeModification = 0, motifModification = NULL WHERE idOffre = ?`;
        const [result] = await db.query(query, [idOffre]);
        return result;
    },

    // Supprimer une offre
    delete: async (idOffre) => {
        const query = `DELETE FROM soumissionnaire WHERE idOffre = ?`;
        const [result] = await db.query(query, [idOffre]);
        return result;
    },

    // Mettre à jour l'évaluation et le classement
    updateEvaluation: async (idOffre, data) => {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return { affectedRows: 0 };
        
        const query = `UPDATE soumissionnaire SET ${fields.join(', ')} WHERE idOffre = ?`;
        values.push(idOffre);
        
        const [result] = await db.query(query, values);
        return result;
    }
};

module.exports = Soumission;
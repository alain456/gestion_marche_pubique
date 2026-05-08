const db = require('../config/db');

const Budget = {
    // Créer un budget en tant que conteneur (par le CGMP ou RAF)
    create: async (data) => {
        const { numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, responsableFinancier } = data;
        const [result] = await db.query(
            'INSERT INTO budget (numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, statusValidation, responsableFinancier) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [numeroBudget, typeBudget, exerciceBudgetaire, montantEstime || 0, sourceFinancier, 'Ouvert', responsableFinancier]
        );
        return result.insertId;
    },

    // Lister tous les budgets conteneurs
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM budget ORDER BY exerciceBudgetaire DESC, numeroBudget ASC');
        return rows;
    },

    // Lister les budgets ouverts pour les demandeurs
    getOuverts: async () => {
        const [rows] = await db.query("SELECT * FROM budget WHERE statusValidation = 'Ouvert' OR statusValidation = 'Valide' ORDER BY numeroBudget ASC");
        return rows;
    },

    // Anciennes méthodes de validation (à adapter si nécessaire)
    createValidation: async (data) => {
        const { idDemande, motif, articles } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Mettre à jour le statut de la demande
            const queryUpdateDemande = "UPDATE demande SET statut = 'Valide', motif = ? WHERE idDemande = ?";
            await connection.query(queryUpdateDemande, [motif, idDemande]);

            // 2. Mettre à jour les prix unitaires des articles
            if (articles && articles.length > 0) {
                for (const art of articles) {
                    await connection.query(
                        "UPDATE ligne_demande SET prixUnitaire = ? WHERE idLigne = ?",
                        [art.prixUnitaire || 0, art.idLigne]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    createRejection: async (data) => {
        const { idDemande, motif } = data;
        const queryUpdateDemande = "UPDATE demande SET statut = 'Rejete', motif = ? WHERE idDemande = ?";
        await db.query(queryUpdateDemande, [motif, idDemande]);
        return true;
    }
};

module.exports = Budget;
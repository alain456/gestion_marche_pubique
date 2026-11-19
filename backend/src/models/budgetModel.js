const db = require('../config/db');

const Budget = {
    // Créer un budget en tant que conteneur (par le CGMP ou RAF)
    create: async (data) => {
        const { numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, responsableFinancier, typeInstitution } = data;
        const [result] = await db.query(
            'INSERT INTO budget (numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, statusValidation, responsableFinancier, typeInstitution) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [numeroBudget, typeBudget, exerciceBudgetaire, montantEstime || 0, sourceFinancier, 'Ouvert', responsableFinancier, typeInstitution]
        );
        return result.insertId;
    },

    // Lister tous les budgets conteneurs
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM budget ORDER BY exerciceBudgetaire DESC, numeroBudget ASC');
        return rows;
    },

    // Trouver le dernier numéro pour un exercice et un type donné
    findLastNumber: async (exercice, type) => {
        const prefixMap = { 'fourniture': 'F', 'travaux': 'T', 'service': 'S' };
        const prefix = prefixMap[type] || 'X';
        const pattern = `BUDGET-${exercice}-${prefix}%`;
        
        const [rows] = await db.query(
            "SELECT numeroBudget FROM budget WHERE numeroBudget LIKE ? ORDER BY numeroBudget DESC LIMIT 1",
            [pattern]
        );
        return rows.length > 0 ? rows[0].numeroBudget : null;
    },

    // Lister les budgets ouverts pour les demandeurs
    getOuverts: async () => {
        const [rows] = await db.query("SELECT * FROM budget WHERE statusValidation = 'Ouvert' OR statusValidation = 'Valide' ORDER BY numeroBudget ASC");
        return rows;
    },

    // Anciennes méthodes de validation (à adapter si nécessaire)
    createValidation: async (data) => {
        const { idDemande, motif, articles, responsableFinancier, montantEstime } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // 1. Mettre à jour le statut de la demande
            // Si montantEstime est null (validation groupée), on garde le montant existant
            if (montantEstime !== null && montantEstime !== undefined) {
                const queryUpdateDemande = `
                    UPDATE demande 
                    SET statut = 'Valide', 
                        motif = ?, 
                        dateValidation = NOW(), 
                        responsableFinancier = ?, 
                        montantEstime = ? 
                    WHERE idDemande = ?
                `;
                const [result] = await connection.query(queryUpdateDemande, [motif, responsableFinancier || 'RAF', montantEstime || 0, idDemande]);
                if (result.affectedRows === 0) {
                    throw new Error('Demande introuvable.');
                }
            } else {
                // Mode validation groupée : ne pas écraser le montantEstime
                const queryUpdateDemande = `
                    UPDATE demande 
                    SET statut = 'Valide', 
                        motif = ?, 
                        dateValidation = NOW(), 
                        responsableFinancier = ?
                    WHERE idDemande = ?
                `;
                const [result] = await connection.query(queryUpdateDemande, [motif, responsableFinancier || 'RAF', idDemande]);
                if (result.affectedRows === 0) {
                    throw new Error('Demande introuvable.');
                }
            }

            // 2. Mettre à jour les prix unitaires des articles si fournis
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
        const queryUpdateDemande = "UPDATE demande SET statut = 'Rejete', motif = ?, renvoyee = 1 WHERE idDemande = ?";
        await db.query(queryUpdateDemande, [motif, idDemande]);
        return true;
    },

    // Activer ou désactiver une ligne budgétaire
    updateStatus: async (id, status) => {
        const query = "UPDATE budget SET statusValidation = ? WHERE idBudget = ?";
        const [result] = await db.query(query, [status, id]);
        return result;
    },

    // Mettre à jour une ligne budgétaire
    update: async (id, data) => {
        const { numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, typeInstitution } = data;
        const query = `
            UPDATE budget 
            SET numeroBudget = ?, typeBudget = ?, exerciceBudgetaire = ?, montantEstime = ?, sourceFinancier = ?, typeInstitution = ?
            WHERE idBudget = ?
        `;
        const [result] = await db.query(query, [numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, typeInstitution, id]);
        return result;
    },

    // Supprimer une ligne budgétaire
    delete: async (id) => {
        // Vérifier que la ligne n'est pas utilisée (demandes non rejetées ou marchés)
        const [budgetRows] = await db.query('SELECT numeroBudget FROM budget WHERE idBudget = ?', [id]);
        if (budgetRows.length === 0) {
            throw new Error('Ligne budgétaire introuvable.');
        }

        const [demandes] = await db.query(
            "SELECT COUNT(*) as n FROM demande WHERE idBudget = ? AND statut <> 'Rejete'",
            [id]
        );
        if (demandes[0].n > 0) {
            throw new Error(`Impossible de supprimer : ${demandes[0].n} demande(s) sont rattachées à cette ligne budgétaire.`);
        }

        const [marches] = await db.query(
            'SELECT COUNT(*) as n FROM marche WHERE numeroBudget = ?',
            [budgetRows[0].numeroBudget]
        );
        if (marches[0].n > 0) {
            throw new Error(`Impossible de supprimer : ${marches[0].n} marché(s) référencent cette ligne budgétaire.`);
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Détacher les demandes rejetées restantes (mettre idBudget à NULL)
            await connection.query("UPDATE demande SET idBudget = NULL WHERE idBudget = ?", [id]);
            
            // 2. Supprimer la ligne budgétaire
            const [result] = await connection.query("DELETE FROM budget WHERE idBudget = ?", [id]);
            
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Obtenir l'état d'un budget (total alloué vs total consommé)
    getBudgetStatus: async (idBudget) => {
        const query = `
            SELECT 
                b.idBudget,
                b.numeroBudget,
                b.montantEstime as montantAlloue,
                COALESCE(SUM(d.montantEstime), 0) as montantConsomme
            FROM budget b
            LEFT JOIN demande d ON b.idBudget = d.idBudget AND d.statut IN ('Valide', 'Inclus dans Marché')
            WHERE b.idBudget = ?
            GROUP BY b.idBudget
        `;
        const [rows] = await db.query(query, [idBudget]);
        return rows[0];
    }
};

module.exports = Budget;
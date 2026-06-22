const Budget = require('../models/budgetModel');
const Demande = require('../models/demandeModel');

exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.findAll();
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des budgets" });
    }
};

exports.getNextBudgetNumber = async (req, res) => {
    const { exercice, type } = req.params;
    try {
        const lastNumber = await Budget.findLastNumber(exercice, type);
        const prefixMap = { 'fourniture': 'F', 'travaux': 'T', 'service': 'S' };
        const prefix = prefixMap[type] || 'X';
        
        let nextSequence = 1;
        if (lastNumber) {
            // Extraire la séquence numérique à la fin (ex: F001 -> 1)
            const match = lastNumber.match(/([FTS])(\d+)$/);
            if (match && match[2]) {
                nextSequence = parseInt(match[2], 10) + 1;
            }
        }
        
        const formattedSequence = String(nextSequence).padStart(3, '0');
        const nextNumber = `BUDGET-${exercice}-${prefix}${formattedSequence}`;
        
        res.json({ nextNumber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du calcul du prochain numéro" });
    }
};

exports.getBudgetsOuverts = async (req, res) => {
    try {
        const budgets = await Budget.getOuverts();
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des budgets ouverts" });
    }
};

exports.createBudget = async (req, res) => {
    const { numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier, typeInstitution } = req.body;
    if (!numeroBudget || !typeBudget || !exerciceBudgetaire) {
        return res.status(400).json({ message: "Le numéro, le type et l'exercice sont requis." });
    }

    try {
        const id = await Budget.create({
            numeroBudget,
            typeBudget,
            exerciceBudgetaire,
            montantEstime,
            sourceFinancier,
            typeInstitution,
            responsableFinancier: req.user.nom
        });
        res.status(201).json({ idBudget: id, message: "Ligne budgétaire créée avec succès" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Ce numéro de budget existe déjà." });
        }
        res.status(500).json({ message: "Erreur lors de la création" });
    }
};

exports.validerBudget = async (req, res) => {
    const { idDemande, motif } = req.body;
    try {
        await Budget.createValidation(req.body);

        // --- Enregistrer l'historique ---
        await Demande.addHistory(null, {
            idDemande: idDemande,
            action: "Validation Budgétaire (RAF)",
            nouveauStatut: "Valide",
            idUtilisateur: req.user.idUser,
            nomUtilisateur: req.user.nom,
            roleUtilisateur: req.user.role,
            motif: motif
        });

        res.json({ message: "Demande validée budgétairement" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la validation" });
    }
};

exports.rejeterBudget = async (req, res) => {
    const { idDemande, motif } = req.body;
    try {
        await Budget.createRejection(req.body);

        // --- Enregistrer l'historique ---
        await Demande.addHistory(null, {
            idDemande: idDemande,
            action: "Rejet Budgétaire (RAF)",
            nouveauStatut: "Rejete",
            idUtilisateur: req.user.idUser,
            nomUtilisateur: req.user.nom,
            roleUtilisateur: req.user.role,
            motif: motif
        });

        res.json({ message: "Demande rejetée budgétairement" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du rejet" });
    }
};

exports.toggleBudgetStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await Budget.updateStatus(id, status);
        res.json({ message: `Budget mis en statut ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

exports.updateBudget = async (req, res) => {
    const { id } = req.params;
    try {
        await Budget.update(id, req.body);
        res.json({ message: "Ligne budgétaire mise à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

exports.deleteBudget = async (req, res) => {
    const { id } = req.params;
    try {
        await Budget.delete(id);
        res.json({ message: "Ligne budgétaire supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || "Erreur lors de la suppression" });
    }
};

exports.getBudgetStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const status = await Budget.getBudgetStatus(id);
        res.json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'état du budget" });
    }
};

exports.bulkValiderBudget = async (req, res) => {
    const { idDemandes, motif } = req.body;
    if (!idDemandes || !Array.isArray(idDemandes) || idDemandes.length === 0) {
        return res.status(400).json({ message: "Liste d'IDs de demandes requise." });
    }

    try {
        for (const id of idDemandes) {
            await Budget.createValidation({
                idDemande: id,
                motif: motif || "Validation groupée RAF",
                responsableFinancier: req.user.nom,
                montantEstime: null 
            });

            await Demande.addHistory(null, {
                idDemande: id,
                action: "Validation Groupée (RAF)",
                nouveauStatut: "Valide",
                idUtilisateur: req.user.idUser,
                nomUtilisateur: req.user.nom,
                roleUtilisateur: req.user.role,
                motif: motif || "Validation groupée"
            });
        }

        res.json({ message: `${idDemandes.length} demandes validées avec succès.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la validation groupée." });
    }
};

exports.getDemandesGroupedByType = async (req, res) => {
    try {
        const grouped = await Demande.getPendingGroupedByType();
        res.json(grouped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes groupées." });
    }
};

exports.getDemandesByType = async (req, res) => {
    const { typeMarche } = req.params;
    try {
        const demandes = await Demande.findByTypeMarche(typeMarche);
        res.json(demandes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes par type." });
    }
};
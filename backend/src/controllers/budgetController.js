const Budget = require('../models/budgetModel');

exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.findAll();
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des budgets" });
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
    const { numeroBudget, typeBudget, exerciceBudgetaire, montantEstime, sourceFinancier } = req.body;
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
    try {
        await Budget.createValidation(req.body);
        res.json({ message: "Demande validée budgétairement" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la validation" });
    }
};

exports.rejeterBudget = async (req, res) => {
    try {
        await Budget.createRejection(req.body);
        res.json({ message: "Demande rejetée budgétairement" });
    } catch (error) {
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
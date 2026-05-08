const Paiement = require('../models/paiementModel');

// Effectuer un paiement pour une réception donnée
exports.effectuerPaiement = async (req, res) => {
    const { idReception, montant, datePaiement } = req.body;

    // Validation des champs obligatoires
    if (!idReception || !montant || !datePaiement) {
        return res.status(400).json({ 
            message: "L'identifiant de la réception, le montant et la date de paiement sont requis." 
        });
    }

    try {
        // Utilisation du modèle pour créer le paiement et mettre à jour le marché
        const result = await Paiement.create({
            idReception,
            montant,
            datePaiement
        });

        if (!result) {
            return res.status(404).json({ message: "La réception spécifiée n'existe pas ou le paiement a échoué." });
        }

        res.status(201).json({ 
            message: "Paiement effectué avec succès. Le marché est désormais clôturé.", 
            idPaiement: result.insertId 
        });
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'enregistrement du paiement." });
    }
};

// Récupérer tous les paiements
exports.getAllPaiements = async (req, res) => {
    try {
        const rows = await Paiement.findAll();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des paiements." });
    }
};
const Soumission = require('../models/soumissionModel');
const sendEmail = require('../config/email');

// Ajouter un soumissionnaire (offre)
exports.addSoumissionnaire = async (req, res) => {
    const { 
        idMarche, 
        nomSoumissionnaire, 
        adresse, 
        telephone, 
        email, 
        referenceAppelOffre, 
        dateSoumission, 
        montantPropose 
    } = req.body;

    if (!idMarche || !nomSoumissionnaire || !montantPropose) {
        return res.status(400).json({ message: "Le marché, le nom du prestataire et le montant sont requis." });
    }

    console.log("📩 Données reçues pour l'offre. Email du soumissionnaire :", email);

    try {
        const result = await Soumission.create({
            idMarche, 
            nomSoumissionnaire, 
            adresse, 
            telephone, 
            email, 
            referenceAppelOffre, 
            dateSoumission, 
            montantPropose
        });
        
        const idOffre = result.insertId;
        
        // Envoi de l'email de confirmation si l'email est fourni
        if (email) {
            try {
                const subject = "Confirmation de dépôt d'offre - SETIC";
                const text = `Bonjour ${nomSoumissionnaire},\n\nVotre offre a été enregistrée avec succès (Offre #${idOffre}).\n\nOffre yawe yabaye enregistre.\n\nCordialement,\nL'équipe SETIC`;
                
                await sendEmail(email, subject, text);
            } catch (emailError) {
                console.error("Erreur lors de l'envoi de l'email de confirmation:", emailError);
            }
        }

        res.status(201).json({ message: "Offre enregistrée avec succès", idOffre });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'offre:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "L'ID du marché saisi n'existe pas." });
        }
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'offre" });
    }
};

// Lister toutes les offres (pour le réceptionniste)
exports.getAllSoumissions = async (req, res) => {
    try {
        const rows = await Soumission.findAll();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des offres" });
    }
};

// Lister toutes les offres reçues pour un marché spécifique
exports.getSoumissionnairesByMarche = async (req, res) => {
    const { idMarche } = req.params;
    try {
        const rows = await Soumission.findByMarche(idMarche);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des offres" });
    }
};

// Mettre à jour une offre
exports.updateSoumission = async (req, res) => {
    const { idOffre } = req.params;
    try {
        await Soumission.update(idOffre, req.body);
        
        // Si c'était une modification autorisée, on réinitialise les drapeaux
        if (req.body.autorisationModification) {
            await Soumission.resetModificationFlags(idOffre);
        }

        res.json({ message: "Offre mise à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'offre" });
    }
};

// Demander une modification (Réceptionniste)
exports.requestModification = async (req, res) => {
    const { idOffre } = req.params;
    const { motifModification } = req.body;
    try {
        await Soumission.requestModification(idOffre, motifModification);
        res.json({ message: "Demande de modification envoyée au RAF." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la demande de modification." });
    }
};

// Autoriser une modification (RAF)
exports.authorizeModification = async (req, res) => {
    const { idOffre } = req.params;
    try {
        await Soumission.authorizeModification(idOffre);
        res.json({ message: "Modification autorisée pour le réceptionniste." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'autorisation de modification." });
    }
};

// Supprimer une offre
exports.deleteSoumission = async (req, res) => {
    const { idOffre } = req.params;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (userRole === 'RECEPTIONISTE') {
        return res.status(403).json({ message: "Les réceptionnistes ne sont pas autorisés à supprimer des offres." });
    }

    try {
        await Soumission.delete(idOffre);
        res.json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'offre" });
    }
};
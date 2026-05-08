const Soumission = require('../models/soumissionModel');

// Enregistrer l'offre 
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
        
        res.status(201).json({ message: "Soumission enregistrée avec succès", idOffre: result.insertId });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'offre:", error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "L'ID du marché saisi n'existe pas." });
        }
        
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'offre: " + (error.sqlMessage || error.message) });
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
const Service = require('../models/serviceModel');

// Creer un nouveau service demandeur
exports.createServiceDemandeur = async (req, res) => {
    const { nomService } = req.body;

    if (!nomService) {
        return res.status(400).json({ message: "Le nom du service est requis." });
    }

    try {
        const result = await Service.create(nomService);
        res.status(201).json({ 
            message: "Service créé avec succès", 
            idService: result.insertId 
        });
    } catch (error) {
        console.error("Erreur lors de la création du service:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du service." });
    }
};

// lister les services demandeurs
exports.getAllServicesDemandeurs = async (req, res) => {
    try {
        const rows = await Service.findAll();
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des services." });
    }
};

// Recuperer un service par son ID
exports.getServiceDemandeurById = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé." });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error("Erreur lors de la récupération du service:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du service." });
    }
};

// Modifier un service demandeur
exports.updateServiceDemandeur = async (req, res) => {
    const { idService, nomService } = req.body;

    if (!idService || !nomService) {
        return res.status(400).json({ message: "L'ID et le nom du service sont requis." });
    }

    try {
        const result = await Service.update(idService, nomService);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service non trouvé." });
        }
        
        res.status(200).json({ message: "Service modifié avec succès." });
    } catch (error) {
        console.error("Erreur lors de la modification du service:", error);
        res.status(500).json({ message: "Erreur serveur lors de la modification." });
    }
};

// Supprimer un service demandeur
exports.deleteServiceDemandeur = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Service.delete(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service non trouvé." });
        }
        
        res.status(200).json({ message: "Service supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression du service:", error);
        res.status(500).json({ message: "Impossible de supprimer ce service car il est probablement lié à d'autres données." });
    }
};
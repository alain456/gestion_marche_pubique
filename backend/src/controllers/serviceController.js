const db = require('../config/db');

// Liste de tous les services
exports.getAllServices = async (req, res) => {
    try {
        const [services] = await db.query('SELECT * FROM servicedemandeur ORDER BY nomService');
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des services" });
    }
};

// Créer un service
exports.createService = async (req, res) => {
    const { nomService } = req.body;
    if (!nomService) {
        return res.status(400).json({ message: "Le nom du service est requis" });
    }
    try {
        await db.query('INSERT INTO servicedemandeur (nomService) VALUES (?)', [nomService]);
        res.json({ message: "Service créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création du service" });
    }
};

// Modifier un service
exports.updateService = async (req, res) => {
    const { idService, nomService } = req.body;
    if (!idService || !nomService) {
        return res.status(400).json({ message: "ID et nom du service sont requis" });
    }
    try {
        await db.query('UPDATE servicedemandeur SET nomService = ? WHERE idService = ?', [nomService, idService]);
        res.json({ message: "Service modifié avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la modification du service" });
    }
};

// Supprimer un service
exports.deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si des utilisateurs sont liés à ce service
        const [users] = await db.query('SELECT idUser FROM utilisateur WHERE idService = ?', [id]);
        if (users.length > 0) {
            return res.status(400).json({ message: "Impossible de supprimer ce service car il est lié à des utilisateurs" });
        }
        
        await db.query('DELETE FROM servicedemandeur WHERE idService = ?', [id]);
        res.json({ message: "Service supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression du service" });
    }
};

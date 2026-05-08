const Contrat = require('../models/contratModel');

// Rédiger un nouveau contrat après l'attribution du marché (par le CGMP)
exports.createContrat = async (req, res) => {
    const { 
        idMarche, 
        titulaireMarche, 
        montant, 
        dateDebut, 
        dateFin, 
        dureeContrat, 
        conditionsContractuelles 
    } = req.body;

    if (!idMarche || !titulaireMarche || !montant || !dateDebut || !dateFin) {
        return res.status(400).json({ message: "Les informations essentielles du contrat (marché, titulaire, montant, dates) sont requises." });
    }

    try {
        const result = await Contrat.create({
            idMarche, 
            titulaireMarche, 
            montant, 
            dateDebut, 
            dateFin, 
            dureeContrat, 
            conditionsContractuelles
        });
        
        res.status(201).json({ 
            message: "Contrat rédigé avec succès et en attente de validation par le Chef d'Institution.", 
            idContrat: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la rédaction du contrat." });
    }
};

// Le Chef d'institution approuve et "signe" le contrat
exports.validerContrat = async (req, res) => {
    const { id } = req.params; // idContrat

    try {
        const result = await Contrat.updateStatus(id, 'Validé');

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Contrat non trouvé." });
        }

        res.json({ message: "Contrat validé avec succès par le Chef d'Institution." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la validation du contrat." });
    }
};
const echeanceAlertModel = require('../models/echeanceAlertModel');

const THRESHOLD_KEYS = [
    'demandeValidationJours',
    'marcheEcheanceJours',
    'paiementJours'
];

exports.getAlerts = async (req, res) => {
    try {
        const thresholds = await echeanceAlertModel.getThresholds();
        const alerts = await echeanceAlertModel.getAlerts({
            user: req.user,
            permissions: req.user.permissions || [],
            thresholds
        });
        res.json({ thresholds, alerts });
    } catch (error) {
        console.error('Erreur lors du chargement des alertes d’échéance:', error);
        res.status(500).json({ message: 'Erreur serveur lors du chargement des alertes.' });
    }
};

exports.getThresholds = async (req, res) => {
    try {
        res.json(await echeanceAlertModel.getThresholds());
    } catch (error) {
        console.error('Erreur lors du chargement des seuils de rappel:', error);
        res.status(500).json({ message: 'Erreur serveur lors du chargement des seuils.' });
    }
};

exports.updateThresholds = async (req, res) => {
    const values = req.body;
    if (!values || typeof values !== 'object' || Array.isArray(values) ||
        THRESHOLD_KEYS.some(key =>
            !Number.isInteger(values[key]) || values[key] < 0 || values[key] > 365
        )) {
        return res.status(400).json({
            message: 'Chaque seuil doit être un nombre entier compris entre 0 et 365 jours.'
        });
    }

    try {
        const thresholds = await echeanceAlertModel.updateThresholds(
            Object.fromEntries(THRESHOLD_KEYS.map(key => [key, values[key]]))
        );
        res.json({ thresholds, message: 'Seuils de rappel enregistrés.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des seuils de rappel:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l’enregistrement des seuils.' });
    }
};

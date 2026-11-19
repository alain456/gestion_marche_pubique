const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findForUser(req.user);
        res.json(notifications);
    } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        res.status(500).json({ message: 'Impossible de charger les notifications.' });
    }
};

exports.markAsRead = async (req, res) => {
    const idHistorique = Number(req.params.idHistorique);
    if (!Number.isInteger(idHistorique) || idHistorique < 1) {
        return res.status(400).json({ message: 'Identifiant de notification invalide.' });
    }

    try {
        const marked = await Notification.markAsRead(idHistorique, req.user);
        if (!marked) {
            return res.status(404).json({ message: 'Notification introuvable.' });
        }
        res.json({ message: 'Notification marquée comme lue.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
        res.status(500).json({ message: 'Impossible de mettre à jour la notification.' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const count = await Notification.markAllAsRead(req.user);
        res.json({ message: 'Notifications marquées comme lues.', count });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des notifications:', error);
        res.status(500).json({ message: 'Impossible de mettre à jour les notifications.' });
    }
};

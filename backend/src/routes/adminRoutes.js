const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const echeanceAlertController = require('../controllers/echeanceAlertController');
const { verifyToken, requireAdminOrPermission, requirePermission } = require('../middlewares/authMiddleware');

// Route protégée : statistiques globales
router.get('/stats', verifyToken, requirePermission('VOIR_STATISTIQUES'), adminController.getStats);
router.get(
    '/dashboard-metrics',
    verifyToken,
    requireAdminOrPermission(['VOIR_STATISTIQUES', 'VALIDER_BUDGET_DEMANDE', 'VOIR_MARCHES', 'GERER_MARCHES']),
    adminController.getDashboardMetrics
);
router.get(
    '/echeances',
    verifyToken,
    requireAdminOrPermission([
        'VOIR_STATISTIQUES',
        'DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES',
        'VOIR_MARCHES', 'GERER_MARCHES', 'EFFECTUER_PAIEMENT', 'VOIR_PAIEMENTS'
    ]),
    echeanceAlertController.getAlerts
);
router.get('/echeances/config', verifyToken, echeanceAlertController.getThresholds);
router.put(
    '/echeances/config',
    verifyToken,
    requireAdminOrPermission('GERER_PARAMETRES_SEUILS'),
    echeanceAlertController.updateThresholds
);

module.exports = router;
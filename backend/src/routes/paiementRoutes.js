const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Routes pour les paiements
router.post('/', requirePermission('EFFECTUER_PAIEMENT'), paiementController.effectuerPaiement);
router.get('/', requirePermission(['VOIR_PAIEMENTS', 'EFFECTUER_PAIEMENT']), paiementController.getAllPaiements);

module.exports = router;
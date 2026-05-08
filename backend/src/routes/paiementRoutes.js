const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Toutes les routes de paiement nécessitent une authentification
router.use(verifyToken);

// Routes pour le service comptable / RAF
router.post('/', authorizeRoles('RAF', 'ADMIN'), paiementController.effectuerPaiement);
router.get('/', authorizeRoles('RAF', 'ADMIN'), paiementController.getAllPaiements);

module.exports = router;
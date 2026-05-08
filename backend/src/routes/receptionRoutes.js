const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionController');

const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Toutes les routes de réception nécessitent une authentification
router.use(verifyToken);

// Routes pour le Réceptionniste / RAF
router.post('/execution', authorizeRoles('RECEPTIONNISTE', 'ADMIN'), receptionController.createExecution);
router.post('/validation', authorizeRoles('RECEPTIONNISTE', 'ADMIN'), receptionController.validerReception);
router.get('/', authorizeRoles('RECEPTIONNISTE', 'RAF', 'ADMIN'), receptionController.getAllReceptions);

module.exports = router;
const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Routes pour la réception
router.post('/execution', requirePermission('ENREGISTRER_EXECUTION'), receptionController.createExecution);
router.post('/validation', requirePermission('VALIDER_RECEPTION'), receptionController.validerReception);
router.get('/', requirePermission('VOIR_RECEPTIONS'), receptionController.getAllReceptions);

module.exports = router;
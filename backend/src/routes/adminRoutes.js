const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

// Route protégée : statistiques globales
router.get('/stats', verifyToken, requirePermission('VOIR_STATISTIQUES'), adminController.getStats);

module.exports = router;
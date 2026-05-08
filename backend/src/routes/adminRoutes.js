const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Assure-toi d'avoir tes middlewares de protection (JWT et Rôle)
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Route protégée : seul un admin ou RAF peut voir ces stats
router.get('/stats', verifyToken, authorizeRoles('ADMIN', 'RAF'), adminController.getStats);

module.exports = router;
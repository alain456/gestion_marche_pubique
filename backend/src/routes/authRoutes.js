const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Cette route sera accessible via POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
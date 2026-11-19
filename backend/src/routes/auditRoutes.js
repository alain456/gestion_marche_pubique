const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, isAdmin, auditController.getAuditLog);

module.exports = router;

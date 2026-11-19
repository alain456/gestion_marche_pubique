const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, auditController.getMyAuditLog);

module.exports = router;

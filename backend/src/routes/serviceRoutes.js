const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, serviceController.getAllServices);
router.post('/', verifyToken, requirePermission('GERER_SERVICES'), serviceController.createService);
router.put('/', verifyToken, requirePermission('GERER_SERVICES'), serviceController.updateService);
router.delete('/:id', verifyToken, requirePermission('GERER_SERVICES'), serviceController.deleteService);

module.exports = router;
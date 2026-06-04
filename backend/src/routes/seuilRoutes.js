const express = require('express');
const router = express.Router();
const seuilController = require('../controllers/seuilController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', seuilController.getAllSeuils);
router.post('/', seuilController.createSeuil);
router.put('/:id', seuilController.updateSeuil);
router.delete('/:id', seuilController.deleteSeuil);

module.exports = router;

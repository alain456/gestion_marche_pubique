const express = require('express');
const router = express.Router();
const parametreController = require('../controllers/parametreController');

router.get('/', parametreController.getAllParametres);
router.post('/', parametreController.createParametre);
router.delete('/:id', parametreController.deleteParametre);

module.exports = router;

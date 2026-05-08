const express = require('express');
const router = express.Router();
const marcheController = require('../controllers/marcheController');

// Définition des routes
router.post('/', marcheController.createMarche);
router.get('/', marcheController.getAllMarches);
router.get('/:id', marcheController.getMarcheById);
router.put('/:id', marcheController.updateMarche);
router.delete('/:id', marcheController.deleteMarche);

module.exports = router;
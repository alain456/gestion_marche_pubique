const express = require('express');
const router = express.Router();
const contratController = require('../controllers/contratController');

// Routes pour la gestion des contrats
router.post('/', contratController.createContrat); // CGMP rédige le contrat
router.put('/:id/valider', contratController.validerContrat); // Chef d'Institution valide le contrat

module.exports = router;
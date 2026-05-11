const express = require('express');
const router = express.Router();
const soumissionController = require('../controllers/soumissionController');

// Routes pour la gestion des offres (CGMP)
router.post('/', soumissionController.addSoumissionnaire);
router.get('/', soumissionController.getAllSoumissions);
router.get('/marche/:idMarche', soumissionController.getSoumissionnairesByMarche);
router.put('/:idOffre', soumissionController.updateSoumission);
router.delete('/:idOffre', soumissionController.deleteSoumission);

module.exports = router;
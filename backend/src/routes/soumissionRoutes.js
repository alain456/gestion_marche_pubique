const express = require('express');
const router = express.Router();
const soumissionController = require('../controllers/soumissionController');

// Routes pour la gestion des offres (CGMP)
router.post('/', soumissionController.addSoumissionnaire);
router.get('/', soumissionController.getAllSoumissions);
router.get('/marche/:idMarche', soumissionController.getSoumissionnairesByMarche);
router.put('/:idOffre', soumissionController.updateSoumission);
router.delete('/:idOffre', soumissionController.deleteSoumission);

// Routes pour les demandes de modification
router.post('/:idOffre/request-modification', soumissionController.requestModification);
router.post('/:idOffre/authorize-modification', soumissionController.authorizeModification);

module.exports = router;
const express = require('express');
const router = express.Router();
const soumissionController = require('../controllers/soumissionController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Réceptionniste: enregistrement/modification/suppression des offres
router.post('/', requirePermission(['ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS']), soumissionController.addSoumissionnaire);
router.put('/:idOffre', requirePermission(['ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS']), soumissionController.updateSoumission);
router.delete('/:idOffre', requirePermission(['ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS']), soumissionController.deleteSoumission);

// Consultation: CGMP (et autres profils autorisés)
router.get('/', requirePermission(['VOIR_MARCHES', 'ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS', 'GERER_BUDGETS']), soumissionController.getAllSoumissions);
router.get('/marche/:idMarche', requirePermission(['VOIR_MARCHES', 'ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS', 'GERER_BUDGETS']), soumissionController.getSoumissionnairesByMarche);

// Routes pour les demandes de modification
router.post('/:idOffre/request-modification', requirePermission(['ENREGISTRER_EXECUTION', 'GERER_SOUMISSIONS']), soumissionController.requestModification);
router.post('/:idOffre/authorize-modification', requirePermission(['GERER_SOUMISSIONS', 'GERER_BUDGETS']), soumissionController.authorizeModification);

// Evaluation CGMP
router.put('/:idOffre/evaluate', requirePermission(['GERER_SOUMISSIONS', 'VOIR_MARCHES']), soumissionController.evaluateSoumission);

module.exports = router;
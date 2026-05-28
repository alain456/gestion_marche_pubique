const express = require('express');
const router = express.Router();
const soumissionController = require('../controllers/soumissionController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Routes pour la gestion des offres (CGMP)
router.post('/', requirePermission('GERER_SOUMISSIONS'), soumissionController.addSoumissionnaire);
router.get('/', requirePermission(['GERER_SOUMISSIONS', 'VOIR_MARCHES']), soumissionController.getAllSoumissions);
router.get('/marche/:idMarche', requirePermission(['GERER_SOUMISSIONS', 'VOIR_MARCHES']), soumissionController.getSoumissionnairesByMarche);
router.put('/:idOffre', requirePermission('GERER_SOUMISSIONS'), soumissionController.updateSoumission);
router.delete('/:idOffre', requirePermission('GERER_SOUMISSIONS'), soumissionController.deleteSoumission);

// Routes pour les demandes de modification
router.post('/:idOffre/request-modification', requirePermission('GERER_SOUMISSIONS'), soumissionController.requestModification);
router.post('/:idOffre/authorize-modification', requirePermission('GERER_SOUMISSIONS'), soumissionController.authorizeModification);

module.exports = router;
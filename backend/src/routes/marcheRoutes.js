const express = require('express');
const router = express.Router();
const marcheController = require('../controllers/marcheController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Routes pour les marchés
router.post('/', requirePermission('GERER_MARCHES'), marcheController.createMarche);
router.get('/', requirePermission(['VOIR_MARCHES', 'GERER_MARCHES']), marcheController.getAllMarches);
router.get('/:id', requirePermission(['VOIR_MARCHES', 'GERER_MARCHES']), marcheController.getMarcheById);
router.put('/:id', requirePermission('GERER_MARCHES'), marcheController.updateMarche);
router.put('/:id/criteres', requirePermission('GERER_MARCHES'), marcheController.updateCriteres);
router.post('/:id/rank', requirePermission('GERER_MARCHES'), marcheController.rankSoumissions);
router.delete('/:id', requirePermission('GERER_MARCHES'), marcheController.deleteMarche);

module.exports = router;
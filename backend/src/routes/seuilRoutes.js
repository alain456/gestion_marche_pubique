const express = require('express');
const router = express.Router();
const seuilController = require('../controllers/seuilController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Lecture des seuils : accessible à tous les utilisateurs connectés (CGMP, RAF, Admin...)
router.get('/', seuilController.getAllSeuils);

// Modifications : réservées aux détenteurs de GERER_PARAMETRES_SEUILS
router.post('/',    requirePermission(['GERER_PARAMETRES_SEUILS']), seuilController.createSeuil);
router.put('/:id',  requirePermission(['GERER_PARAMETRES_SEUILS']), seuilController.updateSeuil);
router.delete('/:id', requirePermission(['GERER_PARAMETRES_SEUILS']), seuilController.deleteSeuil);

module.exports = router;

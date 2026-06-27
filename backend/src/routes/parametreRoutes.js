const express = require('express');
const router = express.Router();
const parametreController = require('../controllers/parametreController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

// Lecture : tous les utilisateurs connectés peuvent lire les paramètres (dictionnaires CGMP)
router.get('/', verifyToken, parametreController.getAllParametres);

// Modifications : réservées aux détenteurs de GERER_PARAMETRES_SEUILS
router.post('/',    verifyToken, requirePermission(['GERER_PARAMETRES_SEUILS']), parametreController.createParametre);
router.delete('/:id', verifyToken, requirePermission(['GERER_PARAMETRES_SEUILS']), parametreController.deleteParametre);

module.exports = router;

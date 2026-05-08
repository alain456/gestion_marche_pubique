const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', dossierController.getAllDossiers);
router.post('/', authorizeRoles('CGMP', 'ADMIN'), dossierController.createDossier);

module.exports = router;
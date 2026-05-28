const express = require('express');
const router = express.Router();
const contratController = require('../controllers/contratController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Routes pour la gestion des contrats
router.post('/', requirePermission('CREER_CONTRAT'), contratController.createContrat); // CGMP rédige le contrat
router.put('/:id/valider', requirePermission('VALIDER_CONTRAT'), contratController.validerContrat); // Chef d'Institution valide le contrat

module.exports = router;
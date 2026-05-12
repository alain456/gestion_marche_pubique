const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Définition des routes pour les demandes
router.post('/', demandeController.createDemande);
router.get('/', demandeController.getAllDemandes);
router.get('/service/:idService', demandeController.getDemandesByService);
router.put('/:id', demandeController.updateDemande);
router.put('/:id/cgmp-update', demandeController.updateDemandeByCgmp);
router.put('/:id/statut', demandeController.updateStatut);
router.delete('/:id', demandeController.deleteDemande);

module.exports = router;
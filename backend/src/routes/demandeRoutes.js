const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Définition des routes pour les demandes
router.post('/', requirePermission(['DEMANDE_CREATE', 'CREER_DEMANDE']), demandeController.createDemande);
router.get('/', requirePermission(['DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES', 'AJUSTER_DEMANDE_CGMP', 'VALIDER_BUDGET_DEMANDE', 'VOIR_MARCHES', 'GERER_MARCHES']), demandeController.getAllDemandes);
router.get('/service/:idService', requirePermission(['DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES', 'AJUSTER_DEMANDE_CGMP', 'VALIDER_BUDGET_DEMANDE', 'VOIR_MARCHES', 'GERER_MARCHES']), demandeController.getDemandesByService);
router.put('/:id', requirePermission(['DEMANDE_UPDATE', 'MODIFIER_DEMANDE']), demandeController.updateDemande);
router.put('/:id/cgmp-update', requirePermission('AJUSTER_DEMANDE_CGMP'), demandeController.updateDemandeByCgmp);
router.put('/:id/statut', requirePermission(['VALIDER_BUDGET_DEMANDE', 'AJUSTER_DEMANDE_CGMP', 'DEMANDE_UPDATE', 'MODIFIER_DEMANDE']), demandeController.updateStatut);
router.put('/:id/mark-vue', requirePermission(['DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES']), demandeController.markAlerteAsVue);
router.put('/:id/mark-raf-vue', requirePermission('VALIDER_BUDGET_DEMANDE'), demandeController.markAlerteRafAsVue);
router.put('/:id/mark-chef-vue', requirePermission('VOIR_STATISTIQUES'), demandeController.markAlerteChefAsVue);
router.get('/:id/history', requirePermission(['DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES', 'VALIDER_BUDGET_DEMANDE', 'AJUSTER_DEMANDE_CGMP']), demandeController.getDemandeHistory);
router.delete('/:id', requirePermission(['DEMANDE_DELETE', 'SUPPRIMER_DEMANDE']), demandeController.deleteDemande);

module.exports = router;
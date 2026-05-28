const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Pour les demandeurs : liste des budgets ouverts (accessible à tous les connectés)
router.get('/ouverts', budgetController.getBudgetsOuverts);

// Gestion des lignes budgétaires (conteneurs)
router.get('/', requirePermission(['VOIR_BUDGETS', 'GERER_BUDGETS', 'AJUSTER_DEMANDE_CGMP', 'VOIR_TOUTES_DEMANDES', 'VALIDER_BUDGET_DEMANDE']), budgetController.getBudgets);
router.get('/next-number/:exercice/:type', requirePermission('GERER_BUDGETS'), budgetController.getNextBudgetNumber);
router.post('/', requirePermission('GERER_BUDGETS'), budgetController.createBudget);
router.put('/:id', requirePermission('GERER_BUDGETS'), budgetController.updateBudget);
router.delete('/:id', requirePermission('GERER_BUDGETS'), budgetController.deleteBudget);
router.patch('/:id/status', requirePermission('GERER_BUDGETS'), budgetController.toggleBudgetStatus);
router.get('/status/:id', requirePermission('VOIR_BUDGETS'), budgetController.getBudgetStatus);

// Validation budgétaire des demandes
router.post('/valider', requirePermission('VALIDER_BUDGET_DEMANDE'), budgetController.validerBudget);
router.post('/bulk-valider', requirePermission('VALIDER_BUDGET_DEMANDE'), budgetController.bulkValiderBudget);
router.post('/rejeter', requirePermission('VALIDER_BUDGET_DEMANDE'), budgetController.rejeterBudget);

// Groupement par type de marché
router.get('/demandes-grouped', requirePermission(['VALIDER_BUDGET_DEMANDE', 'VOIR_BUDGETS', 'GERER_BUDGETS', 'AJUSTER_DEMANDE_CGMP', 'VOIR_TOUTES_DEMANDES']), budgetController.getDemandesGroupedByType);
router.get('/demandes-by-type/:typeMarche', requirePermission(['VALIDER_BUDGET_DEMANDE', 'VOIR_BUDGETS', 'GERER_BUDGETS', 'AJUSTER_DEMANDE_CGMP', 'VOIR_TOUTES_DEMANDES']), budgetController.getDemandesByType);

module.exports = router;
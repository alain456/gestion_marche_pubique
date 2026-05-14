const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Pour les demandeurs : liste des budgets ouverts
router.get('/ouverts', budgetController.getBudgetsOuverts);

// Gestion des lignes budgétaires (conteneurs)
router.get('/', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.getBudgets);
router.get('/next-number/:exercice/:type', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.getNextBudgetNumber);
router.post('/', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.createBudget);
router.put('/:id', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.updateBudget);
router.delete('/:id', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.deleteBudget);
router.patch('/:id/status', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.toggleBudgetStatus);
router.get('/status/:id', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.getBudgetStatus);

// Validation spécifique à une demande
router.post('/valider', authorizeRoles('RAF', 'ADMIN'), budgetController.validerBudget);
router.post('/bulk-valider', authorizeRoles('RAF', 'ADMIN'), budgetController.bulkValiderBudget);
router.post('/rejeter', authorizeRoles('RAF', 'ADMIN'), budgetController.rejeterBudget);

// Validation groupée par typeMarche
router.get('/demandes-grouped', authorizeRoles('RAF', 'ADMIN'), budgetController.getDemandesGroupedByType);
router.get('/demandes-by-type/:typeMarche', authorizeRoles('RAF', 'ADMIN'), budgetController.getDemandesByType);

module.exports = router;
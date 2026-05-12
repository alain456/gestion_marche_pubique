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
router.patch('/:id/status', authorizeRoles('RAF', 'ADMIN', 'CGMP'), budgetController.toggleBudgetStatus);

// Validation spécifique à une demande
router.post('/valider', authorizeRoles('RAF', 'ADMIN'), budgetController.validerBudget);
router.post('/rejeter', authorizeRoles('RAF', 'ADMIN'), budgetController.rejeterBudget);

module.exports = router;
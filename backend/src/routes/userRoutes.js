const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requirePermission, requireAdminOrPermission } = require('../middlewares/authMiddleware');

// Routes pour les utilisateurs
router.post('/', verifyToken, requireAdminOrPermission('GERER_UTILISATEURS'), userController.createUser);
router.get('/', verifyToken, requireAdminOrPermission(['GERER_UTILISATEURS', 'VOIR_UTILISATEURS']), userController.getAllUsers);
router.put('/', verifyToken, requireAdminOrPermission('GERER_UTILISATEURS'), userController.updateUser);
router.delete('/:id', verifyToken, requireAdminOrPermission('GERER_UTILISATEURS'), userController.deleteUser);
router.patch('/:id/toggle-status', verifyToken, requireAdminOrPermission('GERER_UTILISATEURS'), userController.toggleUserStatus);

// Routes pour les rôles
router.post('/roles', verifyToken, requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), userController.createRole);
router.get('/roles', verifyToken, requireAdminOrPermission(['GERER_ROLES_PERMISSIONS', 'GERER_UTILISATEURS', 'VOIR_UTILISATEURS']), userController.getRoles);
router.put('/roles', verifyToken, requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), userController.updateRole);
router.delete('/roles/:idRole', verifyToken, requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), userController.deleteRole);

module.exports = router;
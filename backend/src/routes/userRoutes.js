const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Routes pour les utilisateurs (Protégées : Seul l'Admin peut gérer les utilisateurs)
router.post('/', verifyToken, authorizeRoles('ADMIN'), userController.createUser);
router.get('/', verifyToken, authorizeRoles('ADMIN', 'RAF'), userController.getAllUsers);
router.put('/', verifyToken, authorizeRoles('ADMIN'), userController.updateUser);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), userController.deleteUser);
router.patch('/:id/toggle-status', verifyToken, authorizeRoles('ADMIN'), userController.toggleUserStatus);

// Routes pour les rôles (Protégées)
router.post('/roles', verifyToken, authorizeRoles('ADMIN'), userController.createRole);
router.get('/roles', verifyToken, authorizeRoles('ADMIN', 'RAF'), userController.getRoles);
router.put('/roles', verifyToken, authorizeRoles('ADMIN'), userController.updateRole);
router.delete('/roles/:idRole', verifyToken, authorizeRoles('ADMIN'), userController.deleteRole);

module.exports = router;
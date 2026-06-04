const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { verifyToken, requirePermission, requireAdminOrPermission } = require('../middlewares/authMiddleware');

// Toutes ces routes nécessitent d'être connecté
router.use(verifyToken);

// Récupérer toutes les permissions du système
router.get('/', requireAdminOrPermission(['GERER_ROLES_PERMISSIONS', 'GERER_UTILISATEURS', 'VOIR_UTILISATEURS']), permissionController.getAllPermissions);
router.post('/', requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), permissionController.createPermission);
router.put('/:idPermission', requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), permissionController.updatePermission);
router.delete('/:idPermission', requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), permissionController.deletePermission);

// Récupérer les permissions assignées à un rôle
router.get('/role/:idRole', requireAdminOrPermission(['GERER_ROLES_PERMISSIONS', 'GERER_UTILISATEURS', 'VOIR_UTILISATEURS']), permissionController.getRolePermissions);

// Assigner ou mettre à jour les permissions d'un rôle
router.post('/role/:idRole', requireAdminOrPermission('GERER_ROLES_PERMISSIONS'), permissionController.updateRolePermissions);

// Récupérer les permissions assignées à un utilisateur
router.get('/user/:idUser', requireAdminOrPermission(['GERER_ROLES_PERMISSIONS', 'GERER_UTILISATEURS', 'VOIR_UTILISATEURS']), permissionController.getUserPermissions);

// Détail complet des permissions d'un utilisateur (rôle + individuelles) — admin
router.get('/user/:idUser/detail', requireAdminOrPermission('GERER_UTILISATEURS'), permissionController.getUserPermissionsDetail);

// Assigner ou mettre à jour les permissions d'un utilisateur — admin
router.post('/user/:idUser', requireAdminOrPermission('GERER_UTILISATEURS'), permissionController.updateUserPermissions);

module.exports = router;

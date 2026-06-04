const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

// Tout utilisateur connecté peut voir les articles
router.get('/', verifyToken, articleController.getArticles);

// Seuls les utilisateurs avec la permission GERER_ARTICLES peuvent modifier le catalogue
router.post('/', verifyToken, requirePermission('GERER_ARTICLES'), articleController.createArticle);
router.put('/:id', verifyToken, requirePermission('GERER_ARTICLES'), articleController.updateArticle);
router.delete('/:id', verifyToken, requirePermission('GERER_ARTICLES'), articleController.deleteArticle);

module.exports = router;
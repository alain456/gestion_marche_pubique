const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Tout utilisateur connecté peut voir les articles
router.get('/', verifyToken, articleController.getArticles);

// Seul l'admin peut modifier le catalogue
router.post('/', verifyToken, isAdmin, articleController.createArticle);
router.put('/:id', verifyToken, isAdmin, articleController.updateArticle);
router.delete('/:id', verifyToken, isAdmin, articleController.deleteArticle);

module.exports = router;
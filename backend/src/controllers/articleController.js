const Article = require('../models/articleModel');

exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.getAll();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
};

exports.createArticle = async (req, res) => {
    const { nomArticle, typeArticle } = req.body;
    if (!nomArticle) return res.status(400).json({ message: "Le nom de l'article est requis" });
    if (!typeArticle || !['fourniture', 'travaux', 'service'].includes(typeArticle)) {
        return res.status(400).json({ message: "Le type d'article est requis (fourniture, travaux, service)" });
    }

    try {
        const id = await Article.create(nomArticle, typeArticle);
        res.status(201).json({ idArticle: id, nomArticle, typeArticle, message: "Article créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'article" });
    }
};

exports.updateArticle = async (req, res) => {
    const { id } = req.params;
    const { nomArticle, typeArticle } = req.body;

    try {
        await Article.update(id, nomArticle, typeArticle);
        res.json({ message: "Article mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

exports.deleteArticle = async (req, res) => {
    const { id } = req.params;
    try {
        await Article.delete(id);
        res.json({ message: "Article supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression article:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Impossible de supprimer cet article car il est utilisé dans une ou plusieurs demandes d'achat." });
        }
        res.status(500).json({ message: "Erreur lors de la suppression: " + (error.sqlMessage || error.message) });
    }
};
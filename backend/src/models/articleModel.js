const db = require('../config/db');

const Article = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM article ORDER BY typeArticle ASC, nomArticle ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM article WHERE idArticle = ?', [id]);
        return rows[0];
    },

    getByType: async (typeArticle) => {
        const [rows] = await db.query('SELECT * FROM article WHERE typeArticle = ? ORDER BY nomArticle ASC', [typeArticle]);
        return rows;
    },

    create: async (nomArticle, typeArticle) => {
        const [result] = await db.query('INSERT INTO article (nomArticle, typeArticle) VALUES (?, ?)', [nomArticle, typeArticle]);
        return result.insertId;
    },

    update: async (id, nomArticle, typeArticle) => {
        await db.query('UPDATE article SET nomArticle = ?, typeArticle = ? WHERE idArticle = ?', [nomArticle, typeArticle, id]);
        return true;
    },

    delete: async (id) => {
        await db.query('DELETE FROM article WHERE idArticle = ?', [id]);
        return true;
    }
};

module.exports = Article;
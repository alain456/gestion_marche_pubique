const db = require('../config/db');

const parametreModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM parametre_global ORDER BY typeParam, valeur');
    return rows;
  },

  getByType: async (typeParam) => {
    const [rows] = await db.query('SELECT * FROM parametre_global WHERE typeParam = ? ORDER BY valeur', [typeParam]);
    return rows;
  },

  create: async (data) => {
    const { typeParam, valeur } = data;
    const [result] = await db.query(
      'INSERT INTO parametre_global (typeParam, valeur) VALUES (?, ?)',
      [typeParam, valeur]
    );
    return result.insertId;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM parametre_global WHERE idParam=?', [id]);
    return rows[0] || null;
  },

  // Vérifie si une valeur de dictionnaire est encore utilisée dans les tables métier.
  // Renvoie { utilise, table, count } — les noms de tables/colonnes viennent d'une map interne (pas d'injection).
  isValeurUtilisee: async (typeParam, valeur) => {
    const verifications = {
      TYPE_MARCHE: [
        ['demande', 'typeMarche'],
        ['budget', 'typeBudget'],
        ['article', 'typeArticle'],
        ['seuil_reglementaire', 'typeMarche'],
      ],
      TYPE_INSTITUTION: [
        ['budget', 'typeInstitution'],
        ['seuil_reglementaire', 'typeInstitution'],
      ],
    };

    for (const [table, colonne] of (verifications[typeParam] || [])) {
      const [rows] = await db.query(
        `SELECT COUNT(*) as n FROM ${table} WHERE ${colonne} = ?`,
        [valeur]
      );
      if (rows[0].n > 0) {
        return { utilise: true, table, count: rows[0].n };
      }
    }
    return { utilise: false };
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM parametre_global WHERE idParam=?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = parametreModel;

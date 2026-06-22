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

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM parametre_global WHERE idParam=?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = parametreModel;

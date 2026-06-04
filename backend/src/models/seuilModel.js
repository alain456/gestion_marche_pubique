const db = require('../config/db');

const seuilModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM seuil_reglementaire ORDER BY typeMarche, montantMin');
    return rows;
  },

  create: async (data) => {
    const { typeMarche, montantMin, montantMax, modePassation, label } = data;
    const maxVal = montantMax === '' || montantMax === null ? null : montantMax;
    const [result] = await db.query(
      'INSERT INTO seuil_reglementaire (typeMarche, montantMin, montantMax, modePassation, label) VALUES (?, ?, ?, ?, ?)',
      [typeMarche, montantMin, maxVal, modePassation, label]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { typeMarche, montantMin, montantMax, modePassation, label } = data;
    const maxVal = montantMax === '' || montantMax === null ? null : montantMax;
    const [result] = await db.query(
      'UPDATE seuil_reglementaire SET typeMarche=?, montantMin=?, montantMax=?, modePassation=?, label=? WHERE idSeuil=?',
      [typeMarche, montantMin, maxVal, modePassation, label, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM seuil_reglementaire WHERE idSeuil=?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = seuilModel;

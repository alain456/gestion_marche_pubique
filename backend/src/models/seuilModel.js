const db = require('../config/db');

const seuilModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM seuil_reglementaire ORDER BY typeInstitution, typeMarche, montantMin');
    return rows;
  },

  create: async (data) => {
    const { typeInstitution, typeMarche, montantMin, montantMax, modePassation, label } = data;
    const maxVal = montantMax === '' || montantMax === null ? null : montantMax;
    const [result] = await db.query(
      'INSERT INTO seuil_reglementaire (typeInstitution, typeMarche, montantMin, montantMax, modePassation, label) VALUES (?, ?, ?, ?, ?, ?)',
      [typeInstitution || 'Administrations Publiques et Assimilées', typeMarche, montantMin, maxVal, modePassation, label]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { typeInstitution, typeMarche, montantMin, montantMax, modePassation, label } = data;
    const maxVal = montantMax === '' || montantMax === null ? null : montantMax;
    const [result] = await db.query(
      'UPDATE seuil_reglementaire SET typeInstitution=?, typeMarche=?, montantMin=?, montantMax=?, modePassation=?, label=? WHERE idSeuil=?',
      [typeInstitution || 'Administrations Publiques et Assimilées', typeMarche, montantMin, maxVal, modePassation, label, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM seuil_reglementaire WHERE idSeuil=?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = seuilModel;

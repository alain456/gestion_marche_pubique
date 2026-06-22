const db = require('./src/config/db');
async function update() {
  try {
    await db.query("ALTER TABLE seuil_reglementaire ADD COLUMN typeInstitution VARCHAR(100) DEFAULT 'Administrations Publiques' AFTER idSeuil");
    console.log("Column typeInstitution added.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.error(err);
    }
  }
  process.exit();
}
update();

const pool = require('./src/config/db');

async function test() {
  try {
    const [seuils] = await pool.query('SELECT * FROM seuil_reglementaire');
    console.log("Seuils:", JSON.stringify(seuils, null, 2));
    const [demandes] = await pool.query('SELECT idDemande, typeInstitution, typeMarche, montantEstime FROM demande LIMIT 5');
    console.log("Demandes:", JSON.stringify(demandes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();

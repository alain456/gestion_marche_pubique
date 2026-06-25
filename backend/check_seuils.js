const pool = require('./src/config/db');
async function test() {
  const [seuils] = await pool.query('SELECT * FROM seuil_reglementaire');
  console.log("Seuils actuels:", JSON.stringify(seuils, null, 2));
  process.exit(0);
}
test();

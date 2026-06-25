const pool = require('./src/config/db');
async function test() {
  const [demandes] = await pool.query(`
    SELECT d.idDemande, d.idBudget, b.typeInstitution, b.numeroBudget, d.typeMarche, d.montantEstime 
    FROM demande d 
    LEFT JOIN budget b ON d.idBudget = b.idBudget 
    LIMIT 5`);
  console.log("Demandes:", JSON.stringify(demandes, null, 2));
  process.exit(0);
}
test();

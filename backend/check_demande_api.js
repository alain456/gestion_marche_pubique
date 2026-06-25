const pool = require('./src/config/db');
async function test() {
  const [demandes] = await pool.query(`
    SELECT 
        d.idDemande, 
        da.numeroBudget,
        da.typeInstitution
    FROM demande d
    LEFT JOIN budget da ON d.idBudget = da.idBudget
    WHERE d.idDemande IN (43, 42)
  `);
  console.log("Demandes (43, 42):", JSON.stringify(demandes, null, 2));
  process.exit(0);
}
test();

const pool = require('./src/config/db');
async function test() {
  const [budget] = await pool.query(`SELECT * FROM budget WHERE numeroBudget = 'BUDGET-2026-F001'`);
  console.log("Budget:", budget);
  const [demandes] = await pool.query(`SELECT idDemande, idBudget, typeMarche, statut FROM demande WHERE idBudget = ?`, [budget[0]?.idBudget]);
  console.log("Demandes:", demandes);
  process.exit(0);
}
test();

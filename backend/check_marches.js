const pool = require('./src/config/db');

async function test() {
  const [marches] = await pool.query('SELECT * FROM marche ORDER BY idMarche DESC LIMIT 5');
  console.log("Derniers marchés créés:");
  console.log(marches.map(m => ({
      idMarche: m.idMarche,
      numeroBudget: m.numeroBudget,
      montantEstime: m.montantEstime,
      statut: m.statut
  })));
  process.exit(0);
}
test();

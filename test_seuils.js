const mysql = require('mysql2/promise');
require('dotenv').config({path: './backend/.env'});

async function test() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_marche_publique'
  });
  const [seuils] = await conn.query('SELECT * FROM seuil_reglementaire');
  console.log("Seuils:", seuils);
  const [demandes] = await conn.query('SELECT idDemande, typeInstitution, typeMarche, montantEstime FROM demande LIMIT 5');
  console.log("Demandes:", demandes);
  conn.end();
}
test();

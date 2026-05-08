const db = require('./backend/src/config/db');

async function checkTables() {
  try {
    const [rows] = await db.query("SHOW TABLES");
    console.log("Tables existantes :", rows);
    
    const [columns] = await db.query("DESCRIBE demande");
    console.log("Colonnes de la table 'demande' :", columns);
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur :", error);
    process.exit(1);
  }
}

checkTables();

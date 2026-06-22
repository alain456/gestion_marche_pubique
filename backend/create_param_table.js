const db = require('./src/config/db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS parametre_global (
        idParam INT AUTO_INCREMENT PRIMARY KEY,
        typeParam VARCHAR(50) NOT NULL,
        valeur VARCHAR(100) NOT NULL,
        UNIQUE KEY(typeParam, valeur)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("Table parametre_global created.");
    
    // Insert defaults if empty
    const [rows] = await db.query("SELECT COUNT(*) as count FROM parametre_global");
    if (rows[0].count === 0) {
      const defaults = [
        ['TYPE_INSTITUTION', 'Administrations Publiques et Assimilées'],
        ['TYPE_INSTITUTION', 'Entreprises Publiques à Caractère Commercial'],
        ['TYPE_INSTITUTION', 'Collectivités Territoriales Décentralisées (Communes)'],
        ['TYPE_MARCHE', 'travaux'],
        ['TYPE_MARCHE', 'fourniture'],
        ['TYPE_MARCHE', 'service'],
        ['MODE_PASSATION', 'AO'],
        ['MODE_PASSATION', 'AOR'],
        ['MODE_PASSATION', 'PVN'],
        ['MODE_PASSATION', 'GG'],
        ['MODE_PASSATION', 'DC'],
        ['MODE_PASSATION', 'PA']
      ];
      
      for (let p of defaults) {
        await db.query("INSERT IGNORE INTO parametre_global (typeParam, valeur) VALUES (?, ?)", p);
      }
      console.log("Default parameters inserted.");
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

createTable();

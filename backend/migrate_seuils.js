const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_marche_publique'
  });

  try {
    console.log("Création de la table seuil_reglementaire...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seuil_reglementaire (
        idSeuil INT AUTO_INCREMENT PRIMARY KEY,
        typeMarche VARCHAR(50) NOT NULL,
        montantMin BIGINT NOT NULL DEFAULT 0,
        montantMax BIGINT NULL,
        modePassation VARCHAR(50) NOT NULL,
        label VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Insérer les règles par défaut si la table est vide
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM seuil_reglementaire');
    if (rows[0].count === 0) {
      console.log("Insertion des règles par défaut...");
      await connection.execute(`
        INSERT INTO seuil_reglementaire (typeMarche, montantMin, montantMax, modePassation, label) VALUES
        ('travaux', 10000000, NULL, 'AO', 'Travaux (>= 10 000 000 BIF)'),
        ('fourniture', 5000000, NULL, 'AO', 'Fourniture (>= 5 000 000 BIF)'),
        ('service', 5000000, NULL, 'AO', 'Service (>= 5 000 000 BIF)');
      `);
    }

    console.log("Migration des seuils terminée !");
  } catch (error) {
    console.error("Erreur de migration :", error);
  } finally {
    await connection.end();
  }
}

migrate();

const db = require('./backend/src/config/db');

async function migrate() {
  try {
    console.log("Début de la migration...");

    // 1. Créer la table ligne_demande
    await db.query(`
      CREATE TABLE IF NOT EXISTS ligne_demande (
        idLigne INT AUTO_INCREMENT PRIMARY KEY,
        idDemande INT NOT NULL,
        idArticle INT NOT NULL,
        quantite INT NOT NULL,
        description TEXT,
        FOREIGN KEY (idDemande) REFERENCES demande(idDemande) ON DELETE CASCADE,
        FOREIGN KEY (idArticle) REFERENCES article(idArticle)
      )
    `);
    console.log("✅ Table 'ligne_demande' créée.");

    // 2. Migrer les données existantes
    const [columns] = await db.query("SHOW COLUMNS FROM demande LIKE 'idArticle'");
    if (columns.length > 0) {
      console.log("Migration des données...");
      await db.query(`
        INSERT INTO ligne_demande (idDemande, idArticle, quantite, description)
        SELECT idDemande, idArticle, quantite, description FROM demande
        WHERE idArticle IS NOT NULL
      `);
      console.log("✅ Données migrées.");

      // 3. Supprimer la contrainte de clé étrangère
      console.log("Suppression de la contrainte FK...");
      try {
        await db.query("ALTER TABLE demande DROP FOREIGN KEY demande_ibfk_2");
      } catch (e) {
        console.log("⚠️ Note: Contrainte demande_ibfk_2 non trouvée ou déjà supprimée.");
      }

      // 4. Supprimer les colonnes obsolètes
      await db.query(`
        ALTER TABLE demande 
        DROP COLUMN idArticle,
        DROP COLUMN quantite,
        DROP COLUMN description
      `);
      console.log("✅ Colonnes obsolètes supprimées.");
    }

    console.log("Migration terminée !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error);
    process.exit(1);
  }
}

migrate();

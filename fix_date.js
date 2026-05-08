const db = require('./backend/src/config/db');

async function fixSchema() {
  try {
    console.log("Tentative de modification de la table 'demande'...");
    await db.query(`
      ALTER TABLE demande 
      MODIFY COLUMN dateDemande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log("Succès : dateDemande est maintenant automatique (CURRENT_TIMESTAMP).");
    
    // Optionnel : remplir les dates vides pour les enregistrements existants
    await db.query(`
      UPDATE demande SET dateDemande = CURRENT_TIMESTAMP WHERE dateDemande IS NULL
    `);
    console.log("Succès : Les dates existantes ont été mises à jour.");
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la modification du schéma :", error);
    process.exit(1);
  }
}

fixSchema();

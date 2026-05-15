const db = require('./backend/src/config/db');

async function migrate() {
    try {
        console.log("Migration en cours...");
        await db.query("ALTER TABLE soumissionnaire ADD COLUMN delaiLivraison VARCHAR(100) AFTER montantPropose;");
        console.log("✅ Colonne 'delaiLivraison' ajoutée avec succès !");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ La colonne existe déjà.");
            process.exit(0);
        }
        console.error("❌ Erreur lors de la migration :", err);
        process.exit(1);
    }
}

migrate();

const db = require('./backend/src/config/db');

async function migrate() {
    try {
        console.log("Migration des priorités en cours...");
        await db.query("ALTER TABLE demande ADD COLUMN priorite VARCHAR(20) DEFAULT 'Normale' AFTER typeMarche;");
        console.log("✅ Colonne 'priorite' ajoutée avec succès !");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ La colonne 'priorite' existe déjà.");
            process.exit(0);
        }
        console.error("❌ Erreur lors de la migration :", err);
        process.exit(1);
    }
}

migrate();

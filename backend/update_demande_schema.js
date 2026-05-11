const db = require('./src/config/db');

async function updateSchema() {
    try {
        console.log('Attente de la connexion...');
        const connection = await db.getConnection();
        
        console.log('Ajout des colonnes dateValidation, responsableFinancier et montantEstime à la table demande...');
        
        try {
            await connection.query('ALTER TABLE demande ADD COLUMN dateValidation DATETIME NULL');
            console.log('✅ Colonne dateValidation ajoutée');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Colonne dateValidation déjà existante');
            else throw err;
        }

        try {
            await connection.query('ALTER TABLE demande ADD COLUMN responsableFinancier VARCHAR(255) NULL');
            console.log('✅ Colonne responsableFinancier ajoutée');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Colonne responsableFinancier déjà existante');
            else throw err;
        }

        try {
            await connection.query('ALTER TABLE demande ADD COLUMN montantEstime DECIMAL(15,2) DEFAULT 0');
            console.log('✅ Colonne montantEstime ajoutée');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Colonne montantEstime déjà existante');
            else throw err;
        }

        connection.release();
        console.log('🚀 Schéma mis à jour avec succès');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du schéma:', error);
        process.exit(1);
    }
}

updateSchema();

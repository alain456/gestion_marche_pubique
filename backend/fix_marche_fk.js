const db = require('./src/config/db');

async function updateMarcheSchema() {
    try {
        const connection = await db.getConnection();
        console.log('Suppression de la contrainte FK...');
        try {
            await connection.query('ALTER TABLE marche DROP FOREIGN KEY marche_ibfk_1');
            console.log('✅ FK supprimée');
        } catch (e) {
            console.log('ℹ️ FK non trouvée ou déjà supprimée');
        }

        console.log('Modification de la colonne idDemande en VARCHAR...');
        await connection.query('ALTER TABLE marche MODIFY COLUMN idDemande VARCHAR(255)');
        console.log('✅ Colonne idDemande modifiée');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

updateMarcheSchema();

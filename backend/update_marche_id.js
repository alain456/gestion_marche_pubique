const db = require('./src/config/db');

async function updateMarcheSchema() {
    try {
        const connection = await db.getConnection();
        console.log('Modification de la colonne idDemande dans la table marche...');
        
        // Changer idDemande en VARCHAR pour supporter plusieurs IDs (ex: "27,25")
        await connection.query('ALTER TABLE marche MODIFY COLUMN idDemande VARCHAR(255)');
        console.log('✅ Colonne idDemande modifiée en VARCHAR(255)');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

updateMarcheSchema();

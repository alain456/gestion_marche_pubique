const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gestion_marche_publique'
    });

    try {
        console.log('Adding columns to soumissionnaire table...');
        
        // Add demandeModification
        await connection.query(`
            ALTER TABLE soumissionnaire 
            ADD COLUMN IF NOT EXISTS demandeModification TINYINT(1) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS motifModification TEXT,
            ADD COLUMN IF NOT EXISTS autorisationModification TINYINT(1) DEFAULT 0
        `);

        console.log('Schema updated successfully.');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await connection.end();
    }
}

updateSchema();

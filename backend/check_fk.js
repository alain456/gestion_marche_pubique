const db = require('./src/config/db');

async function checkFK() {
    try {
        const [rows] = await db.query(`
            SELECT 
                COLUMN_NAME, 
                CONSTRAINT_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME 
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_NAME = 'soumissionnaire' 
                AND TABLE_SCHEMA = 'gestion_marche_publique'
        `);
        console.log('Foreign Keys:', JSON.stringify(rows, null, 2));
        
        const [marches] = await db.query('SELECT idMarche FROM marche');
        console.log('Available Market IDs:', marches.map(m => m.idMarche));
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkFK();

const db = require('./src/config/db');

async function updateTypes() {
    try {
        console.log('Updating soumissionnaire table types...');
        
        // Changer montantPropose en BIGINT pour éviter les overflows (FBU peut être grand)
        await db.query('ALTER TABLE soumissionnaire MODIFY COLUMN montantPropose BIGINT');
        console.log('✅ montantPropose changed to BIGINT');
        
        // Changer referenceAppelOffre en VARCHAR pour permettre des références textuelles
        await db.query('ALTER TABLE soumissionnaire MODIFY COLUMN referenceAppelOffre VARCHAR(100)');
        console.log('✅ referenceAppelOffre changed to VARCHAR(100)');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateTypes();

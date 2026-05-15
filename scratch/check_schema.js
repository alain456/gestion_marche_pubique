const db = require('./backend/src/config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE marche');
        console.log('Columns in marche table:');
        rows.forEach(row => {
            console.log(`- ${row.Field}: ${row.Type}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkSchema();

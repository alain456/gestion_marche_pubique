const db = require('./src/config/db');

async function checkTable() {
    try {
        const [rows] = await db.query('DESCRIBE soumissionnaire');
        console.log('Table structure:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTable();

const db = require('./src/config/db');

async function checkRole() {
    try {
        const [rows] = await db.query('SELECT * FROM role WHERE idRole = 6');
        console.log('Role ID 6:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRole();

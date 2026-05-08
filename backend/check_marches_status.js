const db = require('./src/config/db');

async function checkMarches() {
    try {
        const [rows] = await db.query('SELECT idMarche, statut FROM marche');
        console.log('Markets in DB:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkMarches();

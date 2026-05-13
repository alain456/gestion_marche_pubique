const pool = require('./src/config/db');

async function test() {
    try {
        const [rows] = await pool.query('SELECT * FROM historique_demande');
        console.log('Historique entries:', rows.length);
        console.log(rows);
    } catch (err) {
        console.error('Error fetching history:', err.message);
    } finally {
        process.exit();
    }
}

test();

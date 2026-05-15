const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gestion_marche_publique'
    });

    try {
        const [rows] = await pool.query('DESCRIBE marche');
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

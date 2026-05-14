const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRoles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gestion_marche_publique'
    });

    try {
        const [rows] = await connection.query('SELECT * FROM role');
        console.log('Available Roles:', rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
    } finally {
        await connection.end();
    }
}

checkRoles();

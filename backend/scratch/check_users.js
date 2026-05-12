const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [rows] = await connection.execute('SELECT nom, email, idRole FROM utilisateur');
        console.log(rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Adding criteresEvaluation to marche...");
        await connection.query('ALTER TABLE marche ADD COLUMN criteresEvaluation JSON NULL;');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding notesEvaluation to soumissionnaire...");
        await connection.query('ALTER TABLE soumissionnaire ADD COLUMN notesEvaluation JSON NULL;');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding scoreGlobal to soumissionnaire...");
        await connection.query('ALTER TABLE soumissionnaire ADD COLUMN scoreGlobal DECIMAL(5,2) NULL;');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding recommande to soumissionnaire...");
        await connection.query('ALTER TABLE soumissionnaire ADD COLUMN recommande TINYINT(1) DEFAULT 0;');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding choisi to soumissionnaire...");
        await connection.query('ALTER TABLE soumissionnaire ADD COLUMN choisi TINYINT(1) DEFAULT 0;');
    } catch (e) { console.log(e.message); }

    console.log("Migration finished.");
    await connection.end();
}

migrate();

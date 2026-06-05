const fs = require('fs');
const path = require('path');
const mysql = require('./backend/node_modules/mysql2/promise');
require('./backend/node_modules/dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function importDb() {
  try {
    console.log("Starting database import...");
    
    // Create a connection with multipleStatements enabled to run the whole SQL file at once
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_marche_publique',
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, 'database', 'gestion_marche_publique.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found at ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing SQL statements...");
    await connection.query(sql);
    
    console.log("✅ Database successfully imported!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importDb();

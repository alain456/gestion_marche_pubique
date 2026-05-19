const fs = require('fs');
const path = require('path');
const db = require('./backend/src/config/db');

function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (Buffer.isBuffer(val)) {
    return `X'${val.toString('hex')}'`;
  }
  // Escape string
  const escaped = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"": return '\\"';
      case "'": return "\\'";
      case "\\": return "\\\\";
      case "%": return "\\%";
      default: return char;
    }
  });
  return `'${escaped}'`;
}

async function dump() {
  try {
    console.log("Starting database dump...");
    let sql = "";
    sql += "-- SETIC Database Dump\n";
    sql += "SET FOREIGN_KEY_CHECKS=0;\n\n";

    // 1. Get all tables
    const [tables] = await db.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const tableName of tableNames) {
      console.log(`Dumping table: ${tableName}`);
      sql += `-- Table structure for table \`${tableName}\`\n`;
      sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

      // 2. Get create table syntax
      const [createTableResult] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createTableSql = createTableResult[0]['Create Table'];
      sql += `${createTableSql};\n\n`;

      // 3. Get table data
      const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        sql += `-- Dumping data for table \`${tableName}\`\n`;
        const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
        
        sql += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n`;
        const valueStrings = rows.map(row => {
          const vals = Object.values(row).map(escapeValue).join(', ');
          return `(${vals})`;
        });
        sql += valueStrings.join(',\n') + ';\n\n';
      }
    }

    sql += "SET FOREIGN_KEY_CHECKS=1;\n";

    // Ensure database folder exists
    const dbDir = path.join(__dirname, 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
    }

    fs.writeFileSync(path.join(dbDir, 'gestion_marche_publique.sql'), sql);
    console.log("✅ Database successfully dumped to database/gestion_marche_publique.sql");
    process.exit(0);
  } catch (error) {
    console.error("❌ Dump failed:", error);
    process.exit(1);
  }
}

dump();

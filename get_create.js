const db = require('./backend/src/config/db');

async function getCreate() {
  try {
    const [rows] = await db.query("SHOW CREATE TABLE demande");
    console.log(rows[0]['Create Table']);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

getCreate();

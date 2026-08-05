const db = require('./src/config/db');
async function addColumns() {
    try {
        console.log('Adding dateDebutPublication and dateFinPublication columns to marche table...');
        await db.query("ALTER TABLE marche ADD COLUMN dateDebutPublication DATETIME NULL;");
        await db.query("ALTER TABLE marche ADD COLUMN dateFinPublication DATETIME NULL;");
        console.log('Successfully added columns.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error adding columns:', err);
        }
    } finally {
        process.exit();
    }
}
addColumns();

const db = require('./src/config/db');

(async () => {
    try {
        console.log('Adding dateLimite column to marche table...');
        await db.query("ALTER TABLE marche ADD COLUMN dateLimite DATETIME NULL;");
        console.log('Successfully added dateLimite column.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column dateLimite already exists.');
        } else {
            console.error('Error adding column:', error.message);
        }
    } finally {
        process.exit();
    }
})();

const db = require('../backend/src/config/db');

async function addMontantColumn() {
    try {
        const connection = await db.getConnection();
        await connection.query('ALTER TABLE ligne_demande ADD COLUMN montant INT DEFAULT NULL');
        console.log('Colonne montant ajoutée');
        connection.release();
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('La colonne montant existe déjà');
            process.exit(0);
        } else {
            console.error(error);
            process.exit(1);
        }
    }
}

addMontantColumn();

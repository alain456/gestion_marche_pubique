const pool = require('../backend/src/config/db');

async function listUsers() {
    try {
        const [rows] = await pool.query('SELECT idUser, nom, email, est_actif, nomRole FROM utilisateur JOIN role ON utilisateur.idRole = role.idRole');
        console.log("Users in DB:");
        console.table(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
listUsers();

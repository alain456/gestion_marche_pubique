const db = require('./src/config/db');

async function checkUsers() {
    try {
        const query = `
            SELECT u.idUser, u.nom, u.email, u.idRole, r.nomRole, u.est_actif
            FROM utilisateur u
            JOIN role r ON u.idRole = r.idRole
        `;
        const [rows] = await db.query(query);
        console.log('Users in DB:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();

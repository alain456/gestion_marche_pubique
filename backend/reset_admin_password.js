const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function resetPasswords() {
    try {
        const users = [
            { email: 'admin@setic.local', password: '12345678' },
            { email: 'abby@gmail.com', password: '12345678' },
            { email: 'noe@gmail.com', password: '12345678' },
            { email: 'a@gmail.com', password: '12345678' },
            { email: 'l@gmail.com', password: '12345678' }
        ];

        for (const user of users) {
            const hash = await bcrypt.hash(user.password, 10);
            const [result] = await db.query(
                'UPDATE utilisateur SET password = ? WHERE email = ?',
                [hash, user.email]
            );
            if (result.affectedRows > 0) {
                console.log(`Password for ${user.email} reset to "${user.password}"`);
            } else {
                console.log(`User ${user.email} not found.`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetPasswords();

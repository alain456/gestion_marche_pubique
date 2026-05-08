const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function testPassword() {
    try {
        const emailToTest = 'admin@setic.local';
        const passwordToTest = 'admin';
        
        const [rows] = await db.query('SELECT email, password, est_actif FROM utilisateur WHERE email = ?', [emailToTest]);
        if (rows.length === 0) {
            console.log(`User with email "${emailToTest}" NOT found in DB.`);
            const [allUsers] = await db.query('SELECT email FROM utilisateur');
            console.log('Available emails in DB:', allUsers.map(u => `"${u.email}"`).join(', '));
            process.exit(0);
        }
        
        const user = rows[0];
        console.log('User found:', { email: `"${user.email}"`, est_actif: user.est_actif });
        
        const isMatch = await bcrypt.compare(passwordToTest, user.password);
        console.log('Password match:', isMatch);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testPassword();

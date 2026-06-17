const mysql = require('mysql2/promise');
const config = { host: 'localhost', user: 'root', password: '', database: 'gestion_marche_publique' };

async function check() {
  const conn = await mysql.createConnection(config);
  const [rows] = await conn.query(`SELECT r.nomRole, p.codePermission FROM role r LEFT JOIN role_permission rp ON r.idRole = rp.idRole LEFT JOIN permission p ON rp.idPermission = p.idPermission`);
  console.log("Roles and perms:", rows);
  conn.end();
}
check();

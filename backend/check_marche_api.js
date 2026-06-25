const pool = require('./src/config/db');
async function test() {
  const [marches] = await pool.query(`
            SELECT m.*, d.typeMarche, d.priorite, s.nomService,
                   u.nom as nomDemandeur, r.nomRole as roleDemandeur
            FROM marche m
            LEFT JOIN demande d ON m.idDemande = d.idDemande
            LEFT JOIN servicedemandeur s ON d.idService = s.idService
            LEFT JOIN utilisateur u ON d.idDemandeur = u.idUser
            LEFT JOIN role r ON u.idRole = r.idRole
            WHERE m.idMarche = 6
  `);
  console.log("Marche 6:", JSON.stringify(marches, null, 2));
  process.exit(0);
}
test();

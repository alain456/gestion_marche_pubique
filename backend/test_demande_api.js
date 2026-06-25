const pool = require('./src/config/db');
async function test() {
  const [demandes] = await pool.query(`
            SELECT d.*, u.nom as nomDemandeur, s.nomService, b.numeroBudget, b.montantEstime as montantEstimeBudget, b.exerciceBudgetaire, b.typeInstitution
            FROM demande d
            LEFT JOIN utilisateur u ON d.idDemandeur = u.idUser
            LEFT JOIN service s ON u.idService = s.idService
            LEFT JOIN budget b ON d.idBudget = b.idBudget
            WHERE d.statut = 'Valide' OR d.statut = 'Inclus dans Marché'
            ORDER BY d.dateDemande DESC LIMIT 5
  `);
  console.log("Demandes (API format):", JSON.stringify(demandes, null, 2));
  process.exit(0);
}
test();

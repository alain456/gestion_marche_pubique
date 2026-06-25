const pool = require('./src/config/db');

async function test() {
  try {
    const [seuils] = await pool.query('SELECT * FROM seuil_reglementaire');
    
    // Get all valid demands and group them
    const [demandes] = await pool.query(`
        SELECT d.*, b.numeroBudget, b.typeInstitution, b.typeBudget as typeMarcheBudget
        FROM demande d
        LEFT JOIN budget b ON d.idBudget = b.idBudget
        WHERE d.statut = 'Valide'
    `);
    
    const groups = {};
    for (const d of demandes) {
        if (!groups[d.idBudget]) {
            groups[d.idBudget] = {
                idBudget: d.idBudget,
                numeroBudget: d.numeroBudget,
                typeInstitution: d.typeInstitution,
                typeMarche: d.typeMarche || d.typeMarcheBudget,
                totalMontant: 0,
                demandes: []
            };
        }
        groups[d.idBudget].demandes.push(d.idDemande);
        groups[d.idBudget].totalMontant += Number(d.montantEstime || 0);
    }
    
    const normalizeTypeMarche = (value) => (value || '').toString().trim().toLowerCase();
    
    console.log("=== VÉRIFICATION DES MATCHS ===");
    let hasMatch = false;
    
    for (const groupId in groups) {
        const group = groups[groupId];
        console.log(`\nBudget: ${group.numeroBudget || 'N/A'}`);
        console.log(`- Type: ${group.typeMarche}`);
        console.log(`- Institution: ${group.typeInstitution || 'NULL'}`);
        console.log(`- Montant total: ${group.totalMontant} FBU`);
        
        const matchingRule = seuils.find((rule) => {
            const sameInst = rule.typeInstitution === group.typeInstitution;
            const sameType = normalizeTypeMarche(rule.typeMarche) === normalizeTypeMarche(group.typeMarche);
            const minOk = group.totalMontant >= Number(rule.montantMin || 0);
            const maxOk = rule.montantMax === null || rule.montantMax === '' || Number.isNaN(Number(rule.montantMax))
              ? true
              : group.totalMontant <= Number(rule.montantMax);
              
            return sameInst && sameType && minOk && maxOk;
        });
        
        if (matchingRule) {
            console.log(`✅ MATCH TROUVÉ ! -> Règle ID ${matchingRule.idSeuil} (${matchingRule.label} - Mode: ${matchingRule.modePassation})`);
            hasMatch = true;
        } else {
            console.log(`❌ AUCUN MATCH. Vérifiez vos seuils.`);
        }
    }
    
    if (!hasMatch && Object.keys(groups).length > 0) {
        console.log("\n⚠️ Actuellement, AUCUN marché (budget) en attente ne correspond à vos seuils configurés !");
    }
    
    process.exit(0);
  } catch(e) {
      console.error(e);
      process.exit(1);
  }
}
test();

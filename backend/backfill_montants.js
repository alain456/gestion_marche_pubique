const db = require('./src/config/db');

async function backfillMontantEstime() {
    try {
        const connection = await db.getConnection();
        console.log('Récupération des demandes validées...');
        
        const [demandes] = await connection.query("SELECT idDemande FROM demande WHERE statut = 'Valide'");
        
        for (const d of demandes) {
            const [articles] = await connection.query("SELECT SUM(prixUnitaire * quantite) as total FROM ligne_demande WHERE idDemande = ?", [d.idDemande]);
            const total = articles[0].total || 0;
            
            await connection.query("UPDATE demande SET montantEstime = ? WHERE idDemande = ?", [total, d.idDemande]);
            console.log(`✅ Demande #${d.idDemande} mise à jour avec ${total} FBU`);
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

backfillMontantEstime();

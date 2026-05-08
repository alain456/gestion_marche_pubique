const db = require('../config/db');

// Tracer le début des travaux  (Exécution)
exports.createExecution = async (req, res) => {
    const { idMarche, livreur, dateExecution } = req.body;

    if (!idMarche || !livreur || !dateExecution) {
        return res.status(400).json({ 
            message: "L'identifiant du marché, le nom du livreur/prestataire et la date d'exécution sont requis." 
        });
    }

    try {
        const query = `INSERT INTO execution (idMarche, livreur, dateExecution) VALUES (?, ?, ?)`;
        const [result] = await db.query(query, [idMarche, livreur, dateExecution]);

        // Optionnel : Mettre à jour le statut du marché
        await db.query("UPDATE marche SET statut = 'En cours d'exécution' WHERE idMarche = ?", [idMarche]);

        res.status(201).json({ 
            message: "Début d'exécution tracé avec succès.", 
            idExecution: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du traçage de l'exécution." });
    }
};

// Rédiger le PV de réception (conforme ou avec réserves)
exports.validerReception = async (req, res) => {
    const { 
        idExecution, 
        idContrat, 
        typeReception, 
        dateReception, 
        conformite, 
        observation, 
        etat 
    } = req.body;

    if (!idContrat || !typeReception || !dateReception || !conformite) {
        return res.status(400).json({ message: "Les informations de conformité et le contrat sont requis pour la réception." });
    }

    try {
        const query = `
            INSERT INTO reception (idExecution, idContrat, typeReception, dateReception, conformite, observation, etat) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            idExecution, idContrat, typeReception, dateReception, conformite, observation, etat
        ]);

        res.status(201).json({ 
            message: "PV de réception enregistré avec succès.", 
            idReception: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la validation de la réception." });
    }
};

// Récupérer toutes les réceptions
exports.getAllReceptions = async (req, res) => {
    try {
        const query = `
            SELECT r.*, c.titulaireMarche, c.montant, m.idDemande
            FROM reception r
            JOIN contrat c ON r.idContrat = c.idContrat
            JOIN marche m ON c.idMarche = m.idMarche
            ORDER BY r.dateReception DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des réceptions." });
    }
};
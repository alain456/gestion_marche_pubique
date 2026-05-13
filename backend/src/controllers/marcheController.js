const Marche = require('../models/marcheModel');
const Demande = require('../models/demandeModel');

// Liste des statuts autorisés
const STATUTS_VALIDES = ['en attente', 'publie', 'attribution', 'suspendu', 'cloture'];

// Creer un nouveau marché
exports.createMarche = async (req, res) => {
    const { 
        idDemande,
        montantEstime, 
        modePassation, 
        justificationChoix, 
        seuilReglementaireApplique, 
        dateSelection, 
        validateur, 
        statut, 
        dateCloture, 
        cloturePar, 
        commentaire 
    } = req.body;


    // Validation du statut si fourni
    const statutFinal = statut ? statut.toLowerCase() : 'en attente';
    if (!STATUTS_VALIDES.includes(statutFinal)) {
        return res.status(400).json({ message: "Statut invalide. Les valeurs possibles sont : en attente, attribue, cloture." });
    }

    try {
        // Sanatisation des données pour la base de données (chaînes vides -> null)
        const sanitizedData = {
            idDemande,
            montantEstime: montantEstime || null,
            modePassation,
            justificationChoix: justificationChoix || null,
            seuilReglementaireApplique: seuilReglementaireApplique || null,
            dateSelection: dateSelection || null,
            validateur: validateur || null,
            statut: statutFinal,
            dateCloture: dateCloture || null,
            cloturePar: cloturePar || null,
            commentaire: commentaire || null
        };

        const result = await Marche.create(sanitizedData);
        
        // --- Mettre à jour le statut des demandes et enregistrer l'historique ---
        if (idDemande) {
            const ids = idDemande.toString().split(',');
            for (const idD of ids) {
                const trimmedId = idD.trim();
                if (!trimmedId) continue;

                // Mise à jour du statut de la demande
                await Demande.updateStatut(trimmedId, "Inclus dans Marché", `Inclus dans le Marché Public #${result.insertId}`);

                // Ajout à l'historique
                await Demande.addHistory(null, {
                    idDemande: trimmedId,
                    action: "Création du Marché Public",
                    nouveauStatut: "Inclus dans Marché",
                    idUtilisateur: req.user.idUser,
                    nomUtilisateur: req.user.nom,
                    roleUtilisateur: req.user.role,
                    motif: `Inclus dans le marché #${result.insertId} (Mode: ${modePassation})`
                });
            }
        }

        res.status(201).json({ 
            message: "Marché créé avec succès", 
            idMarche: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création du marché" });
    }
};

// Récupérer tous les marchés
exports.getAllMarches = async (req, res) => {
    try {
        const rows = await Marche.findAll();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des marchés" });
    }
};

// Récupérer un marché par ID
exports.getMarcheById = async (req, res) => {
    const { id } = req.params;
    try {
        const marche = await Marche.findById(id);
        if (!marche) return res.status(404).json({ message: "Marché non trouvé" });
        res.json(marche);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour les informations d'un marché
exports.updateMarche = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Validation du statut si présent
    if (data.statut && !STATUTS_VALIDES.includes(data.statut.toLowerCase())) {
        return res.status(400).json({ message: `Statut invalide. Utilisez : ${STATUTS_VALIDES.join(', ')}.` });
    }

    try {
        const result = await Marche.update(id, data);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }
        
        res.json({ message: "Marché mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du marché" });
    }
};

// Supprimer un marché
exports.deleteMarche = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Marche.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }
        res.json({ message: "Marché supprimé avec succès" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Impossible de supprimer un marché lié à d'autres données." });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
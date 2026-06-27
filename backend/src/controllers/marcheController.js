const Marche = require('../models/marcheModel');
const Demande = require('../models/demandeModel');

// Liste des statuts autorisés
const STATUTS_VALIDES = ['brouillon', 'en attente', 'publie', 'attribution', 'suspendu', 'cloture'];

// Creer un nouveau marché
exports.createMarche = async (req, res) => {
    const { 
        idDemande,
        numeroBudget,
        montantEstime, 
        modePassation, 
        justificationChoix, 
        seuilReglementaireApplique, 
        dateSelection, 
        validateur, 
        statut, 
        dateCloture, 
        cloturePar, 
        commentaire,
        dateLimite
    } = req.body;


    // Validation du statut si fourni
    const statutFinal = statut ? statut.toLowerCase() : 'en attente';
    if (!STATUTS_VALIDES.includes(statutFinal)) {
        return res.status(400).json({ message: "Statut invalide. Les valeurs possibles sont : brouillon, en attente, publie, attribution, cloture." });
    }

    try {
        let formattedDateLimite = dateLimite || null;
        if (formattedDateLimite && formattedDateLimite.includes('T')) {
            formattedDateLimite = formattedDateLimite.replace('T', ' ') + ':00';
        } else if (formattedDateLimite === '') {
            formattedDateLimite = null;
        }

        // Sanatisation des données pour la base de données (chaînes vides -> null)
        const sanitizedData = {
            idDemande,
            numeroBudget: numeroBudget || null,
            montantEstime: montantEstime || null,
            modePassation,
            justificationChoix: justificationChoix || null,
            seuilReglementaireApplique: seuilReglementaireApplique || null,
            dateSelection: dateSelection || null,
            validateur: validateur || null,
            statut: statutFinal,
            dateCloture: dateCloture || null,
            cloturePar: cloturePar || null,
            commentaire: commentaire || null,
            dateLimite: formattedDateLimite
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

    // Convertir dateLimite du format HTML (2026-06-03T10:30) vers MySQL (2026-06-03 10:30:00)
    if (data.dateLimite && data.dateLimite.includes('T')) {
        data.dateLimite = data.dateLimite.replace('T', ' ') + ':00';
    } else if (data.dateLimite === '') {
        data.dateLimite = null;
    }

    try {
        const result = await Marche.update(id, data);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }

        // Si le statut a été modifié, on l'ajoute à l'historique des demandes liées
        if (data.statut) {
            const marche = await Marche.findById(id);
            if (marche && marche.idDemande) {
                const ids = marche.idDemande.toString().split(',');
                for (const idD of ids) {
                    const trimmedId = idD.trim();
                    if (!trimmedId) continue;

                    await Demande.addHistory(null, {
                        idDemande: trimmedId,
                        action: "Mise à jour du Marché",
                        nouveauStatut: "Inclus dans Marché",
                        idUtilisateur: req.user.idUser,
                        nomUtilisateur: req.user.nom,
                        roleUtilisateur: req.user.role,
                        motif: `Le marché #${id} est passé au statut : ${data.statut.toUpperCase()}`
                    });
                }
            }
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
        const marche = await Marche.findById(id);
        if (marche && marche.idDemande) {
            const ids = marche.idDemande.toString().split(',');
            for (const idD of ids) {
                const trimmedId = idD.trim();
                if (!trimmedId) continue;

                // Remettre la demande en état "Valide"
                await Demande.updateStatut(trimmedId, "Valide", `Marché #${id} supprimé - Demande remise en attente de traitement.`);
                
                // Historique
                await Demande.addHistory(null, {
                    idDemande: trimmedId,
                    action: "Retrait du Marché",
                    nouveauStatut: "Valide",
                    idUtilisateur: req.user.idUser,
                    nomUtilisateur: req.user.nom,
                    roleUtilisateur: req.user.role,
                    motif: `Le marché #${id} a été supprimé. La demande est de nouveau disponible pour la CGMP.`
                });
            }
        }

        const result = await Marche.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }
        res.json({ message: "Marché supprimé avec succès. Les demandes liées sont à nouveau disponibles." });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Impossible de supprimer un marché lié à d'autres données." });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};

// Définir les critères d'évaluation
exports.updateCriteres = async (req, res) => {
    const { id } = req.params;
    const { criteres } = req.body;
    
    if (!criteres) {
        return res.status(400).json({ message: "Les critères sont requis." });
    }

    try {
        const result = await Marche.updateCriteres(id, JSON.stringify(criteres));
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }
        res.json({ message: "Critères d'évaluation définis avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour des critères" });
    }
};

// Calculer le classement et recommander le mieux-disant (proximité au montant estimé)
exports.rankSoumissions = async (req, res) => {
    const { id } = req.params;
    
    try {
        const Soumission = require('../models/soumissionModel');
        const { selectMieuxDisant } = require('../utils/mieuxDisant');
        const marche = await Marche.findById(id);
        if (!marche) return res.status(404).json({ message: "Marché non trouvé" });

        const montantEstime = Number(marche.montantEstime);
        if (!montantEstime || montantEstime <= 0) {
            return res.status(400).json({ message: "Le montant estimé du marché est requis pour identifier le mieux-disant." });
        }

        const soumissions = await Soumission.findByMarche(id);
        if (!soumissions || soumissions.length === 0) {
            return res.status(400).json({ message: "Aucune offre à évaluer." });
        }

        const validSoumissions = soumissions.filter(s => s.statut !== 'rejete');
        if (validSoumissions.length === 0) {
            return res.status(400).json({ message: "Aucune offre valide pour le classement." });
        }

        const analysis = selectMieuxDisant(validSoumissions, montantEstime);

        for (const s of validSoumissions) {
            const row = analysis.ranked.find(r => r.offer.idOffre === s.idOffre);
            const proximityScore = row?.isEligible
                ? Math.max(0, 100 - Math.abs(row.diffPercent))
                : 0;

            await Soumission.updateEvaluation(s.idOffre, {
                scoreGlobal: proximityScore,
                recommande: 0
            });
        }

        if (!analysis.best) {
            return res.status(400).json({
                message: "Aucune offre admissible : le montant proposé doit être au moins égal au montant estimé et ne pas dépasser la tolérance maximale au-dessus du budget."
            });
        }

        const best = analysis.best.offer;
        await Soumission.updateEvaluation(best.idOffre, { recommande: 1 });

        if (marche.idDemande) {
            const ids = marche.idDemande.toString().split(',');
            for (const idD of ids) {
                const trimmedId = idD.trim();
                if (!trimmedId) continue;
                await Demande.addHistory(null, {
                    idDemande: trimmedId,
                    action: "Classement des offres calculé",
                    statutPrecedent: marche.statut,
                    nouveauStatut: marche.statut,
                    idUtilisateur: req.user.idUser,
                    nomUtilisateur: req.user.nom,
                    roleUtilisateur: req.user.role,
                    motif: `Mieux-disant : offre #${best.idOffre} (${best.nomSoumissionnaire}) — ${Number(best.montantPropose).toLocaleString()} FBU, la plus proche du montant estimé (${montantEstime.toLocaleString()} FBU).`
                });
            }
        }

        res.json({
            message: "Mieux-disant identifié : offre la plus proche du montant estimé du marché.",
            mieuxDisant: {
                idOffre: best.idOffre,
                nomSoumissionnaire: best.nomSoumissionnaire,
                montantPropose: best.montantPropose,
                montantEstime,
                ecart: analysis.best.diff,
                ecartPercent: analysis.best.diffPercent
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du calcul du classement" });
    }
};
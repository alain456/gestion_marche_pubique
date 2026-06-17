const Soumission = require('../models/soumissionModel');
const sendEmail = require('../config/email');

// Ajouter un soumissionnaire (offre)
exports.addSoumissionnaire = async (req, res) => {
    const { 
        idMarche, 
        nomSoumissionnaire, 
        adresse, 
        telephone, 
        email, 
        referenceAppelOffre, 
        dateSoumission, 
        montantPropose 
    } = req.body;

    if (!idMarche || !nomSoumissionnaire) {
        return res.status(400).json({ message: "Le marché et le nom du prestataire sont requis." });
    }

    console.log("📩 Données reçues pour l'offre. Email du soumissionnaire :", email);

    try {
        const result = await Soumission.create({
            idMarche, 
            nomSoumissionnaire, 
            adresse, 
            telephone, 
            email, 
            referenceAppelOffre, 
            dateSoumission, 
            montantPropose,
            delaiLivraison: req.body.delaiLivraison
        });
        
        const idOffre = result.insertId;
        
        // Envoi de l'email de confirmation si l'email est fourni
        if (email) {
            try {
                const subject = "Confirmation de dépôt d'offre - SETIC";
                const montantText = montantPropose ? `Montant proposé : ${Number(montantPropose).toLocaleString()} FBU\n` : '';
                const text = `Bonjour ${nomSoumissionnaire},\n\n` +
                             `Nous vous confirmons que votre offre a été enregistrée avec succès par notre service de réception.\n\n` +
                             `DÉTAILS DE L'ENREGISTREMENT :\n` +
                             `---------------------------\n` +
                             `N° Offre : #${idOffre}\n` +
                             `Marché : #${idMarche}\n` +
                             `Téléphone enregistré : ${telephone}\n` +
                             montantText +
                             `Date : ${new Date(dateSoumission).toLocaleDateString()}\n\n` +
                             `Offre yawe yabaye enregistre neza  cane muri SETIC.\n\n` +
                             `Cordialement,\n` +
                             `L'équipe SETIC - Gestion des Marchés Publics`;
                
                await sendEmail(email, subject, text);
            } catch (emailError) {
                console.error("Erreur lors de l'envoi de l'email de confirmation:", emailError);
            }
        }

        res.status(201).json({ message: "Offre enregistrée avec succès", idOffre });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'offre:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "L'ID du marché saisi n'existe pas." });
        }
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'offre" });
    }
};

// Lister toutes les offres (pour le réceptionniste)
exports.getAllSoumissions = async (req, res) => {
    try {
        const rows = await Soumission.findAll();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des offres" });
    }
};

// Lister toutes les offres reçues pour un marché spécifique
exports.getSoumissionnairesByMarche = async (req, res) => {
    const { idMarche } = req.params;
    try {
        const rows = await Soumission.findByMarche(idMarche);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des offres" });
    }
};

// Mettre à jour une offre
exports.updateSoumission = async (req, res) => {
    const { idOffre } = req.params;
    const { 
        idMarche, 
        nomSoumissionnaire, 
        telephone, 
        email, 
        dateSoumission, 
        montantPropose 
    } = req.body;

    try {
        // Charger l'ancienne offre pour comparer et tracer les modifications
        const oldOffre = await Soumission.findById(idOffre);

        // Calcul des changements pour l'historique et l'email
        const changements = [];
        if (oldOffre) {
            const oldNom = oldOffre.nomSoumissionnaire || '';
            const newNom = nomSoumissionnaire || oldNom;
            if (oldNom !== newNom) changements.push(`Nom: '${oldNom}' -> '${newNom}'`);
            
            const oldMontant = oldOffre.montantPropose || 0;
            const newMontant = montantPropose || oldMontant;
            if (Number(oldMontant) !== Number(newMontant)) changements.push(`Montant: ${oldMontant} -> ${newMontant}`);
            
            const oldTel = oldOffre.telephone || '';
            const newTel = telephone || oldTel;
            if (oldTel !== newTel) changements.push(`Tel: '${oldTel}' -> '${newTel}'`);
            
            const oldMail = oldOffre.email || '';
            const newMail = email || oldMail;
            if (oldMail !== newMail) changements.push(`Email: '${oldMail}' -> '${newMail}'`);
        }
        const detailsChangementText = changements.length > 0 ? changements.join(', ') : 'Aucun changement détecté';
        const emailChangementsText = changements.length > 0 ? `- ${changements.join('\n- ')}` : 'Mise à jour générale du dossier sans modification des champs principaux.';

        await Soumission.update(idOffre, req.body);
        
        // Si c'était une modification autorisée, on réinitialise les drapeaux
        if (req.body.autorisationModification) {
            await Soumission.resetModificationFlags(idOffre);

            // --- Historique détaillé des modifications (non-bloquant) ---
            try {
                if (oldOffre && oldOffre.idMarche) {
                    const Marche = require('../models/marcheModel');
                    const Demande = require('../models/demandeModel');
                    const marche = await Marche.findById(oldOffre.idMarche);
                    
                    if (marche && marche.idDemande) {
                        await Demande.addHistory(null, {
                            idDemande: marche.idDemande,
                            action: "Modification d'offre effectuée",
                            statutPrecedent: marche.statut,
                            nouveauStatut: marche.statut,
                            idUtilisateur: req.user.idUser,
                            nomUtilisateur: req.user.nom,
                            roleUtilisateur: req.user.role,
                            motif: `Le réceptionniste a modifié l'offre #${idOffre}. Motif initial de la demande: ${oldOffre.motifModification || 'Non spécifié'}. Changements apportés: ${detailsChangementText}`
                        });
                    }
                }
            } catch (histErr) {
                console.error("[Historique] Erreur de traçabilité de modification d'offre:", histErr.message);
            }
        }

        // Envoi de l'email de confirmation de mise à jour si l'email est fourni
        if (email && nomSoumissionnaire) {
            try {
                const subject = "Mise à jour de votre offre - SETIC";
                const montantText = montantPropose ? `Montant proposé : ${Number(montantPropose).toLocaleString()} FBU\n` : '';
                const text = `Bonjour ${nomSoumissionnaire},\n\n` +
                             `Nous vous informons que votre offre a été mise à jour avec succès par notre service de réception.\n\n` +
                             `MODIFICATIONS APPORTÉES :\n` +
                             `---------------------------\n` +
                             `${emailChangementsText}\n\n` +
                             `DÉTAILS ACTUELS DE L'OFFRE :\n` +
                             `---------------------------\n` +
                             `N° Offre : #${idOffre}\n` +
                             `Marché : #${idMarche || 'N/A'}\n` +
                             `Téléphone enregistré : ${telephone || 'N/A'}\n` +
                             montantText +
                             `Date : ${dateSoumission ? new Date(dateSoumission).toLocaleDateString() : 'N/A'}\n\n` +
                             `Ihinduka ry'offre yawe ryabaye enregistre neza muri SETIC.\n\n` +
                             `Cordialement,\n` +
                             `L'équipe SETIC - Gestion des Marchés Publics`;
                
                await sendEmail(email, subject, text);
            } catch (emailError) {
                console.error("Erreur lors de l'envoi de l'email de mise à jour:", emailError);
            }
        }

        res.json({ message: "Offre mise à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'offre" });
    }
};

// Demander une modification (Réceptionniste)
exports.requestModification = async (req, res) => {
    const { idOffre } = req.params;
    const { motifModification } = req.body;
    try {
        await Soumission.requestModification(idOffre, motifModification);
        
        // --- Historique (non-bloquant) ---
        try {
            const offre = await Soumission.findById(idOffre);
            if (offre && offre.idMarche) {
                const Marche = require('../models/marcheModel');
                const Demande = require('../models/demandeModel');
                const marche = await Marche.findById(offre.idMarche);
                
                if (marche && marche.idDemande) {
                    await Demande.addHistory(null, {
                        idDemande: marche.idDemande,
                        action: "Demande de modification d'offre",
                        statutPrecedent: marche.statut,
                        nouveauStatut: marche.statut,
                        idUtilisateur: req.user.idUser,
                        nomUtilisateur: req.user.nom,
                        roleUtilisateur: req.user.role,
                        motif: `Demande de modification pour l'offre #${idOffre} (${offre.nomSoumissionnaire}): ${motifModification}`
                    });
                }
            }
        } catch (histErr) {
            console.error("[Historique] Erreur non-bloquante lors de la demande de modification:", histErr.message);
        }

        res.json({ message: "Demande de modification envoyée au RAF." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la demande de modification." });
    }
};

// Autoriser une modification (RAF)
exports.authorizeModification = async (req, res) => {
    const { idOffre } = req.params;
    try {
        await Soumission.authorizeModification(idOffre);
        
        // --- Historique (non-bloquant) ---
        try {
            const offre = await Soumission.findById(idOffre);
            if (offre) {
                const Marche = require('../models/marcheModel');
                const Demande = require('../models/demandeModel');
                const marche = await Marche.findById(offre.idMarche);
                
                if (marche && marche.idDemande) {
                    await Demande.addHistory(null, {
                        idDemande: marche.idDemande,
                        action: "Autorisation de modification d'offre",
                        statutPrecedent: marche.statut,
                        nouveauStatut: marche.statut,
                        idUtilisateur: req.user.idUser,
                        nomUtilisateur: req.user.nom,
                        roleUtilisateur: req.user.role,
                        motif: `Le RAF a autorisé la modification de l'offre #${idOffre} (${offre.nomSoumissionnaire}) pour le réceptionniste.`
                    });
                }
            }
        } catch (histErr) {
            console.error("[Historique] Erreur non-bloquante lors de l'autorisation de modification:", histErr.message);
        }

        res.json({ message: "Modification autorisée pour le réceptionniste." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'autorisation de modification." });
    }
};

// Supprimer une offre
exports.deleteSoumission = async (req, res) => {
    const { idOffre } = req.params;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (userRole === 'RECEPTIONISTE') {
        return res.status(403).json({ message: "Les réceptionnistes ne sont pas autorisés à supprimer des offres." });
    }

    try {
        await Soumission.delete(idOffre);
        res.json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'offre" });
    }
};

// Evaluer une offre (CGMP)
exports.evaluateSoumission = async (req, res) => {
    const { idOffre } = req.params;
    const { notesEvaluation } = req.body; // Objet JSON contenant les notes techniques

    if (!notesEvaluation) {
        return res.status(400).json({ message: "Les notes d'évaluation sont requises." });
    }

    try {
        const offre = await Soumission.findById(idOffre);
        if (!offre) return res.status(404).json({ message: "Offre non trouvée." });

        await Soumission.updateEvaluation(idOffre, {
            notesEvaluation: JSON.stringify(notesEvaluation)
        });

        res.json({ message: "Notes techniques enregistrées avec succès pour cette offre." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'évaluation." });
    }
};
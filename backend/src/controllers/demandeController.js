const Demande = require('../models/demandeModel');

// Types de marchés autorisés
const TYPES_MARCHE_VALIDES = ['travaux', 'fourniture', 'service'];
const STATUTS_VALIDES = [
    'Brouillon', 
    'Soumis',
    'En attente', 
    'Valide', 
    'Rejete'
];

// Créer une nouvelle demande d'achat avec plusieurs articles
exports.createDemande = async (req, res) => {
    const { idService, typeMarche, statut, articles, idBudget } = req.body;

    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    const isSpecialRole = userRole === 'RAF' || userRole === 'ADMIN';

    // Validation des champs obligatoires
    if (!isSpecialRole && (!idService || !idBudget || !articles || !Array.isArray(articles) || articles.length === 0)) {
        return res.status(400).json({ message: "Le service, le budget et au moins un article sont requis." });
    }
    if (isSpecialRole && (!articles || !Array.isArray(articles) || articles.length === 0)) {
        return res.status(400).json({ message: "Au moins un article est requis." });
    }

    // Validation du type de marché
    const typeMarcheFinal = typeMarche ? typeMarche.toLowerCase() : null;
    if (!typeMarcheFinal || !TYPES_MARCHE_VALIDES.includes(typeMarcheFinal)) {
        return res.status(400).json({ message: "Type de marché invalide." });
    }

    // Validation du statut
    const statutFinal = statut && STATUTS_VALIDES.includes(statut) ? statut : 'En attente';

    try {
        const result = await Demande.create({
            idService,
            idUser: req.user.idUser,
            typeMarche: typeMarcheFinal,
            statut: statutFinal,
            articles, // [{ idArticle, quantite, description }, ...]
            idBudget
        });
        
        res.status(201).json({ 
            message: statutFinal === 'Brouillon' ? "Brouillon enregistré avec succès" : "Demande d'achat créée avec succès", 
            idDemande: result.idDemande 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la demande" });
    }
};

// Mettre à jour une demande (articles et/ou statut)
exports.updateDemande = async (req, res) => {
    const { id } = req.params;
    const { articles, statut, typeMarche, motif } = req.body;

    try {
        // Si on met à jour les articles
        if (articles && Array.isArray(articles)) {
            await Demande.updateArticles(id, articles);
        }

        // Si on met à jour le statut
        if (statut && STATUTS_VALIDES.includes(statut)) {
            await Demande.updateStatut(id, statut, motif);
        }

        res.json({ message: "Demande mise à jour avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour." });
    }
};

exports.updateStatut = async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut || !STATUTS_VALIDES.includes(statut)) {
        return res.status(400).json({ message: "Statut invalide." });
    }

    try {
        await Demande.updateStatut(id, statut);
        res.json({ message: "Statut mis à jour avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour." });
    }
};

exports.getAllDemandes = async (req, res) => {
    try {
        const { role, idService } = req.user;
        const mesDemandes = req.query.mesdemandes === 'true';
        let rows;

        // Si c'est un ADMIN, RAF ou CGMP, il voit tout (sauf si mesdemandes=true)
        const userRole = role ? role.toUpperCase() : '';
        if ((userRole === 'ADMIN' || userRole === 'RAF' || userRole === 'CGMP') && !mesDemandes) {
            rows = await Demande.findAll();
        } else {
            // Sinon (DEMANDEUR, CHEF_SERVICE, ou mesdemandes=true), il ne voit que son service
            rows = await Demande.findByService(idService);
        }
        
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes." });
    }
};

exports.getDemandesByService = async (req, res) => {
    const { idService } = req.params;
    try {
        const rows = await Demande.findByService(idService);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération." });
    }
};

exports.deleteDemande = async (req, res) => {
    const { id } = req.params;
    try {
        await Demande.delete(id);
        res.json({ message: "Demande supprimée avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};
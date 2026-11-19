const db = require('../config/db');

const Demande = {
    // Requête commune : récupère les demandes avec leurs lignes groupées.
    // Filtres optionnels : idUser, idService, typeMarche (+ statut 'En attente' si onlyPending)
    findDemandes: async ({ idUser, idService, typeMarche, onlyPending } = {}) => {
        const conditions = [];
        const params = [];

        if (idUser !== undefined) {
            conditions.push('d.idUser = ?');
            params.push(idUser);
        }
        if (idService !== undefined) {
            conditions.push('(d.idService = ? OR (? IS NULL AND d.idService IS NULL))');
            params.push(idService, idService);
        }
        if (typeMarche !== undefined) {
            conditions.push('d.typeMarche = ?');
            params.push(typeMarche);
        }
        if (onlyPending) {
            conditions.push("d.statut = 'En attente'");
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        const query = `
            SELECT
                d.*,
                s.nomService,
                (
                    SELECT GROUP_CONCAT(DISTINCT m.idMarche ORDER BY m.idMarche)
                    FROM marche m
                    WHERE FIND_IN_SET(d.idDemande, m.idDemande) > 0
                ) as marchesAssocies,
                da.numeroBudget,
                da.exerciceBudgetaire,
                da.sourceFinancier,
                da.typeInstitution,
                da.montantEstime as montantEstimeBudget,
                u.nom as nomDemandeur,
                r.nomRole as roleDemandeur,
                c.nomChef,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'idLigne', l.idLigne,
                        'idArticle', l.idArticle,
                        'nomArticle', a.nomArticle,
                        'quantite', l.quantite,
                        'prixUnitaire', l.prixUnitaire,
                        'montant', l.montant,
                        'description', l.description
                    )
                ) as articles
            FROM demande d
            LEFT JOIN budget da ON d.idBudget = da.idBudget
            LEFT JOIN servicedemandeur s ON d.idService = s.idService
            LEFT JOIN utilisateur u ON d.idUser = u.idUser
            LEFT JOIN role r ON u.idRole = r.idRole
            LEFT JOIN (
                SELECT u.idService, u.nom as nomChef
                FROM utilisateur u
                JOIN role r ON u.idRole = r.idRole
                WHERE r.nomRole IN ('CHEF_SERVICE', 'CHEF_INSTITUTION')
            ) c ON d.idService = c.idService
            LEFT JOIN ligne_demande l ON d.idDemande = l.idDemande
            LEFT JOIN article a ON l.idArticle = a.idArticle
            ${whereClause}
            GROUP BY d.idDemande
            ORDER BY d.dateDemande DESC
        `;

        const [rows] = await db.query(query, params);

        return rows.map(row => ({
            ...row,
            articles: row.articles
                ? JSON.parse(`[${row.articles}]`)
                : []
        }));
    },

    // Créer une demande avec plusieurs lignes (transactionnel)
    create: async (data) => {
        const { idService, idUser, typeMarche, priorite, statut, articles, idBudget } = data;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Créer le header (demande)
            const headerQuery = `
                INSERT INTO demande 
                (idService, idUser, typeMarche, priorite, statut, idBudget) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [headerResult] = await connection.query(headerQuery, [
                idService,
                idUser,
                typeMarche,
                priorite || 'Normale',
                statut || 'En attente',
                idBudget
            ]);

            const idDemande = headerResult.insertId;

            // 2. Créer les lignes
            if (articles && articles.length > 0) {
                const lineQuery = `
                    INSERT INTO ligne_demande 
                    (idDemande, idArticle, quantite, prixUnitaire, description, montant) 
                    VALUES ?
                `;

                const lineValues = articles.map(art => [
                    idDemande,
                    art.idArticle,
                    art.quantite,
                    art.prixUnitaire || 0,
                    art.description || '',
                    art.montant || null
                ]);

                await connection.query(lineQuery, [lineValues]);
            }

            await connection.commit();

            return { idDemande };

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    },

    // Récupérer toutes les demandes avec leurs lignes groupées
    findAll: async () => Demande.findDemandes(),

    // Récupérer par service
    findByService: async (idService) => Demande.findDemandes({ idService }),

    // Récupérer par utilisateur (Strictement mes demandes)
    findByUser: async (idUser) => Demande.findDemandes({ idUser }),

    // Mettre à jour les articles d'une demande
    updateArticles: async (idDemande, articles) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Supprimer anciennes lignes
            await connection.query(
                'DELETE FROM ligne_demande WHERE idDemande = ?',
                [idDemande]
            );

            // Ajouter nouvelles lignes
            if (articles && articles.length > 0) {
                const lineQuery = `INSERT INTO ligne_demande (idDemande, idArticle, quantite, prixUnitaire, description, montant) VALUES ?`;
                const lineValues = articles.map(art => [idDemande, art.idArticle, art.quantite, art.prixUnitaire || 0, art.description || '', art.montant || null]);

                await connection.query(lineQuery, [lineValues]);
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    },

    // Mise à jour spécifique par la CGMP (avec flag de modification)
    updateByCgmp: async (idDemande, articles, montantEstime, motif) => {

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Supprimer anciennes lignes
            await connection.query(
                'DELETE FROM ligne_demande WHERE idDemande = ?',
                [idDemande]
            );

            // Ajouter nouvelles lignes
            if (articles && articles.length > 0) {

                const lineQuery = `
                    INSERT INTO ligne_demande 
                    (idDemande, idArticle, quantite, prixUnitaire, description, montant) 
                    VALUES ?
                `;

                const lineValues = articles.map(art => [
                    idDemande,
                    art.idArticle,
                    art.quantite,
                    art.prixUnitaire || 0,
                    art.description || '',
                    art.montant || null
                ]);

                await connection.query(lineQuery, [lineValues]);
            }

            // 2. Marquer comme modifié par CGMP, mettre à jour le montant, ajouter le motif et réinitialiser les alertes (RAF et Chef)
            await connection.query(
                'UPDATE demande SET modifieParCgmp = 1, montantEstime = ?, motif = ?, alerteVue = 0, alerteRaf = 0, alerteChef = 0 WHERE idDemande = ?',
                [montantEstime, motif || 'Ajustement technique CGMP', idDemande]

            );

            await connection.commit();

            return true;

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    },

    // Mise à jour statut
    updateStatut: async (id, statut, motif = undefined, role = undefined) => {
        const setAlerteRaf = role === 'CGMP' ? ', alerteRaf = 0' : '';

        if (statut === 'Rejete') {
            if (motif !== undefined) {
                await db.query(`UPDATE demande SET statut = ?, motif = ?, renvoyee = 1, alerteVue = 0${setAlerteRaf} WHERE idDemande = ?`, [statut, motif, id]);
            } else {
                await db.query(`UPDATE demande SET statut = ?, renvoyee = 1, alerteVue = 0${setAlerteRaf} WHERE idDemande = ?`, [statut, id]);
            }
        } else {
            if (motif !== undefined) {
                await db.query(`UPDATE demande SET statut = ?, motif = ?, alerteVue = 0${setAlerteRaf} WHERE idDemande = ?`, [statut, motif, id]);
            } else {
                await db.query(`UPDATE demande SET statut = ?, alerteVue = 0${setAlerteRaf} WHERE idDemande = ?`, [statut, id]);
            }

        }

        return true;
    },

    markAlerteAsVue: async (id) => {
        await db.query('UPDATE demande SET alerteVue = 1 WHERE idDemande = ?', [id]);
        return true;
    },

    markAlerteRafAsVue: async (id) => {
        await db.query('UPDATE demande SET alerteRaf = 1 WHERE idDemande = ?', [id]);
        return true;
    },
    markAlerteChefAsVue: async (id) => {
        await db.query('UPDATE demande SET alerteChef = 1 WHERE idDemande = ?', [id]);
        return true;
    },

    // Supprimer une demande


    delete: async (id) => {

        await db.query(
            'DELETE FROM demande WHERE idDemande = ?',
            [id]
        );

        return true;
    },

    // --- HISTORIQUE ---
    addHistory: async (connection, data) => {
        const { idDemande, action, statutPrecedent, nouveauStatut, idUtilisateur, nomUtilisateur, roleUtilisateur, motif } = data;
        const query = `
            INSERT INTO historique_demande 
            (idDemande, action, statutPrecedent, nouveauStatut, idUtilisateur, nomUtilisateur, roleUtilisateur, motif) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [idDemande, action, statutPrecedent, nouveauStatut, idUtilisateur, nomUtilisateur, roleUtilisateur, motif || null];
        
        if (connection) {
            await connection.query(query, values);
        } else {
            await db.query(query, values);
        }
    },

    getHistory: async (idDemande) => {
        const query = `
            SELECT * FROM historique_demande 
            WHERE idDemande = ? 
            ORDER BY dateAction DESC
        `;
        const [rows] = await db.query(query, [idDemande]);
        return rows;
    },

    // Récupérer les demandes en attente groupées par typeMarche pour validation RAF
    getPendingGroupedByType: async () => {
        const query = `
            SELECT 
                d.typeMarche,
                COUNT(*) as count,
                GROUP_CONCAT(d.idDemande) as ids,
                GROUP_CONCAT(s.nomService) as services,
                SUM(
                    COALESCE(
                        (SELECT SUM(COALESCE(ld.montant, ld.quantite * ld.prixUnitaire, 0))
                         FROM ligne_demande ld 
                         WHERE ld.idDemande = d.idDemande), 
                        0
                    )
                ) as totalMontant
            FROM demande d
            LEFT JOIN servicedemandeur s ON d.idService = s.idService
            WHERE d.statut = 'En attente'
            GROUP BY d.typeMarche
            ORDER BY d.typeMarche
        `;
        const [rows] = await db.query(query);
        return rows.map(row => ({
            typeMarche: row.typeMarche,
            count: row.count,
            ids: row.ids ? row.ids.split(',').map(id => parseInt(id)) : [],
            services: row.services ? row.services.split(',') : [],
            totalMontant: row.totalMontant || 0
        }));
    },

    // Récupérer les demandes d'un typeMarche spécifique (en attente)
    findByTypeMarche: async (typeMarche) =>
        Demande.findDemandes({ typeMarche, onlyPending: true })
};

module.exports = Demande;
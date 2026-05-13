const db = require('../config/db');

const Demande = {
    // Créer une demande avec plusieurs lignes (transactionnel)
    create: async (data) => {
        const { idService, idUser, typeMarche, statut, articles, idBudget } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // 1. Créer le header (demande)
            const headerQuery = `INSERT INTO demande (idService, idUser, typeMarche, statut, idBudget) VALUES (?, ?, ?, ?, ?)`;
            const [headerResult] = await connection.query(headerQuery, [idService, idUser, typeMarche, statut || 'En attente', idBudget]);
            const idDemande = headerResult.insertId;

            // 2. Créer les lignes
            if (articles && articles.length > 0) {
                const lineQuery = `INSERT INTO ligne_demande (idDemande, idArticle, quantite, description, montant) VALUES ?`;
                const lineValues = articles.map(art => [idDemande, art.idArticle, art.quantite, art.description, art.montant || null]);
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
    findAll: async () => {
        const query = `
            SELECT 
                d.*, 
                s.nomService,
                da.numeroBudget,
                da.exerciceBudgetaire,
                da.sourceFinancier,
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
            GROUP BY d.idDemande
            ORDER BY d.dateDemande DESC
        `;
        const [rows] = await db.query(query);
        
        // Parser le JSON retourné par GROUP_CONCAT
        return rows.map(row => ({
            ...row,
            articles: row.articles ? JSON.parse(`[${row.articles}]`) : []
        }));
    },

    // Récupérer par service
    findByService: async (idService) => {
        const query = `
            SELECT 
                d.*,
                da.numeroBudget, 
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
            LEFT JOIN ligne_demande l ON d.idDemande = l.idDemande
            LEFT JOIN article a ON l.idArticle = a.idArticle
            WHERE (d.idService = ? OR (? IS NULL AND d.idService IS NULL))
            GROUP BY d.idDemande
            ORDER BY d.dateDemande DESC
        `;
        const [rows] = await db.query(query, [idService, idService]);
        return rows.map(row => ({
            ...row,
            articles: row.articles ? JSON.parse(`[${row.articles}]`) : []
        }));
    },

    // Mettre à jour les articles d'une demande (pour modification par le demandeur ou CGMP)
    updateArticles: async (idDemande, articles) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Supprimer les anciennes lignes
            await connection.query('DELETE FROM ligne_demande WHERE idDemande = ?', [idDemande]);

            // 2. Insérer les nouvelles lignes (incluant prixUnitaire s'il existe)
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
    updateByCgmp: async (idDemande, articles, montantEstime) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Mettre à jour les articles
            await connection.query('DELETE FROM ligne_demande WHERE idDemande = ?', [idDemande]);
            if (articles && articles.length > 0) {
                const lineQuery = `INSERT INTO ligne_demande (idDemande, idArticle, quantite, prixUnitaire, description) VALUES ?`;
                const lineValues = articles.map(art => [idDemande, art.idArticle, art.quantite, art.prixUnitaire || 0, art.description || '']);
                await connection.query(lineQuery, [lineValues]);
            }

            // 2. Marquer comme modifié par CGMP et mettre à jour le montant total
            await connection.query(
                'UPDATE demande SET modifieParCgmp = 1, montantEstime = ? WHERE idDemande = ?',
                [montantEstime, idDemande]
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

    updateStatut: async (id, statut, motif = undefined) => {
        if (statut === 'Rejete') {
            if (motif !== undefined) {
                await db.query('UPDATE demande SET statut = ?, motif = ?, renvoyee = 1 WHERE idDemande = ?', [statut, motif, id]);
            } else {
                await db.query('UPDATE demande SET statut = ?, renvoyee = 1 WHERE idDemande = ?', [statut, id]);
            }
        } else {
            if (motif !== undefined) {
                await db.query('UPDATE demande SET statut = ?, motif = ? WHERE idDemande = ?', [statut, motif, id]);
            } else {
                await db.query('UPDATE demande SET statut = ? WHERE idDemande = ?', [statut, id]);
            }
        }
        return true;
    },

    delete: async (id) => {
        // La suppression des lignes est gérée par ON DELETE CASCADE
        await db.query('DELETE FROM demande WHERE idDemande = ?', [id]);
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
    }
};

module.exports = Demande;

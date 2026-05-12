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

    // Mettre à jour les articles d'une demande (pour modification)
    updateArticles: async (idDemande, articles) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Supprimer les anciennes lignes
            await connection.query('DELETE FROM ligne_demande WHERE idDemande = ?', [idDemande]);

            // 2. Insérer les nouvelles lignes
            if (articles && articles.length > 0) {
                const lineQuery = `INSERT INTO ligne_demande (idDemande, idArticle, quantite, description, montant) VALUES ?`;
                const lineValues = articles.map(art => [idDemande, art.idArticle, art.quantite, art.description, art.montant || null]);
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

    updateStatut: async (id, statut, motif = undefined) => {
        if (motif !== undefined) {
            await db.query('UPDATE demande SET statut = ?, motif = ? WHERE idDemande = ?', [statut, motif, id]);
        } else {
            await db.query('UPDATE demande SET statut = ? WHERE idDemande = ?', [statut, id]);
        }
        return true;
    },

    delete: async (id) => {
        // La suppression des lignes est gérée par ON DELETE CASCADE
        await db.query('DELETE FROM demande WHERE idDemande = ?', [id]);
        return true;
    }
};

module.exports = Demande;
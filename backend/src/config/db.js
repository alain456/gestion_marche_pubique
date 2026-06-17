const mysql = require('mysql2/promise');
require('dotenv').config(); // Permet de lire les variables du fichier .env

// Création d'un pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_marche_publique',
    waitForConnections: true,
    connectionLimit: 10, // Nombre maximum de connexions simultanées
    queueLimit: 0
});

// Petit test de connexion au démarrage
pool.getConnection()
    .then(async connection => {
        console.log('✅ Connecté à la base de données MySQL (gestion_marche_publique)');
        
        // Vérifier si la colonne est_actif existe, sinon la créer
        try {
            await connection.query(`ALTER TABLE utilisateur ADD COLUMN est_actif TINYINT(1) DEFAULT 1`);
            console.log('✅ Colonne est_actif ajoutée à la table utilisateur');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Colonne est_actif déjà existante');
            }
        }

        // Vérifier si la colonne modifieParCgmp existe dans demande, sinon la créer
        try {
            await connection.query(`ALTER TABLE demande ADD COLUMN modifieParCgmp TINYINT(1) DEFAULT 0`);
            console.log('✅ Colonne modifieParCgmp ajoutée à la table demande');
        } catch (err) {
            // console.log('ℹ️ Colonne modifieParCgmp déjà existante');
        }

        // Vérifier si la colonne alerteVue existe dans demande, sinon la créer
        try {
            await connection.query(`ALTER TABLE demande ADD COLUMN alerteVue TINYINT(1) DEFAULT 1`);
            console.log('✅ Colonne alerteVue ajoutée à la table demande');
        } catch (err) {
            // console.log('ℹ️ Colonne alerteVue déjà existante');
        }

        // Vérifier si la colonne alerteRaf existe dans demande, sinon la créer
        try {
            await connection.query(`ALTER TABLE demande ADD COLUMN alerteRaf TINYINT(1) DEFAULT 1`);
            console.log('✅ Colonne alerteRaf ajoutée à la table demande');
        } catch (err) {
            // console.log('ℹ️ Colonne alerteRaf déjà existante');
        }

        // Vérifier si la colonne alerteChef existe dans demande, sinon la créer
        try {
            await connection.query(`ALTER TABLE demande ADD COLUMN alerteChef TINYINT(1) DEFAULT 1`);
            console.log('✅ Colonne alerteChef ajoutée à la table demande');
        } catch (err) {
            // console.log('ℹ️ Colonne alerteChef déjà existante');
        }

        // Créer la table historique_demande si elle n'existe pas
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS historique_demande (
                    idHistorique INT AUTO_INCREMENT PRIMARY KEY,
                    idDemande INT NOT NULL,
                    action VARCHAR(255) NOT NULL,
                    statutPrecedent VARCHAR(50),
                    nouveauStatut VARCHAR(50),
                    idUtilisateur INT,
                    nomUtilisateur VARCHAR(255),
                    roleUtilisateur VARCHAR(50),
                    motif TEXT,
                    dateAction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (idDemande) REFERENCES demande(idDemande) ON DELETE CASCADE
                )
            `);
            console.log('✅ Table historique_demande vérifiée/créée');
        } catch (err) {
            console.error('❌ Erreur lors de la création de la table historique_demande:', err.message);
        }

        // Vérifier si la colonne numeroBudget existe dans marche, sinon la créer
        try {
            await connection.query(`ALTER TABLE marche ADD COLUMN numeroBudget VARCHAR(100) AFTER idDemande`);
            console.log('✅ Colonne numeroBudget ajoutée à la table marche');
        } catch (err) {
            // console.log('ℹ️ Colonne numeroBudget déjà existante');
        }

        // --- NOUVEAU SYSTÈME DE PERMISSIONS ---
        // 1. Créer les tables du système de permissions
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS permission (
                    idPermission INT AUTO_INCREMENT PRIMARY KEY,
                    codePermission VARCHAR(100) NOT NULL UNIQUE,
                    description VARCHAR(255)
                )
            `);
            await connection.query(`
                CREATE TABLE IF NOT EXISTS role_permission (
                    idRole INT NOT NULL,
                    idPermission INT NOT NULL,
                    PRIMARY KEY (idRole, idPermission),
                    FOREIGN KEY (idRole) REFERENCES role(idRole) ON DELETE CASCADE,
                    FOREIGN KEY (idPermission) REFERENCES permission(idPermission) ON DELETE CASCADE
                )
            `);
            await connection.query(`
                CREATE TABLE IF NOT EXISTS utilisateur_permission (
                    idUser INT NOT NULL,
                    idPermission INT NOT NULL,
                    typePermission ENUM('GRANT','REVOKE') NOT NULL DEFAULT 'GRANT',
                    PRIMARY KEY (idUser, idPermission),
                    FOREIGN KEY (idUser) REFERENCES utilisateur(idUser) ON DELETE CASCADE,
                    FOREIGN KEY (idPermission) REFERENCES permission(idPermission) ON DELETE CASCADE
                )
            `);
            // Compatibilité : ajouter la colonne si la table existait déjà
            try {
                await connection.query(`
                    ALTER TABLE utilisateur_permission
                    ADD COLUMN typePermission ENUM('GRANT','REVOKE') NOT NULL DEFAULT 'GRANT'
                `);
            } catch (err) {
                // colonne déjà existante
            }
            console.log('✅ Tables du système de permissions vérifiées/créées');

            // Synchroniser la liste complète des permissions du système
            const allPermsData = [
                ['GERER_UTILISATEURS', 'Créer, modifier, désactiver ou supprimer des utilisateurs'],
                ['VOIR_UTILISATEURS', 'Consulter la liste des utilisateurs du système'],
                ['GERER_ROLES_PERMISSIONS', 'Créer/modifier des rôles et leurs permissions'],
                ['GERER_SERVICES', 'Ajouter, modifier ou supprimer des services'],
                ['GERER_ARTICLES', 'Gérer le catalogue des articles/produits'],
                ['VOIR_STATISTIQUES', 'Accéder aux tableaux de bord et statistiques globales'],
                ['CREER_DEMANDE', "Créer une nouvelle demande d'achat"],
                ['VOIR_MES_DEMANDES', 'Consulter ses propres demandes ou celles de son service'],
                ['VOIR_TOUTES_DEMANDES', "Consulter l'ensemble des demandes du système"],
                ['MODIFIER_DEMANDE', 'Modifier une demande avant validation'],
                ['SUPPRIMER_DEMANDE', 'Supprimer une demande non encore traitée'],
                // Permissions CRUD granulaires - Module Demande
                ['DEMANDE_CREATE', "Créer une demande d'achat (CRUD Demande)"],
                ['DEMANDE_READ_OWN', "Lire ses propres demandes (CRUD Demande)"],
                ['DEMANDE_READ_ALL', "Lire toutes les demandes du système (CRUD Demande)"],
                ['DEMANDE_UPDATE', "Mettre à jour une demande (CRUD Demande)"],
                ['DEMANDE_DELETE', "Supprimer une demande (CRUD Demande)"],
                ['AJUSTER_DEMANDE_CGMP', 'Modifier les quantités ou montants des demandes validées'],
                ['GERER_BUDGETS', 'Créer, allouer et modifier des lignes budgétaires'],
                ['VOIR_BUDGETS', "Consulter l'état des budgets disponibles"],
                ['VALIDER_BUDGET_DEMANDE', 'Valider ou rejeter les demandes par rapport au budget'],
                ['VOIR_MARCHES', "Suivre l'état d'avancement des marchés publics"],
                ['GERER_MARCHES', 'Créer un marché à partir de demandes et le configurer'],
                ['GERER_SOUMISSIONS', 'Ajouter des soumissionnaires et sélectionner un gagnant'],
                ['CREER_CONTRAT', 'Rédiger le contrat pour le soumissionnaire sélectionné'],
                ['VALIDER_CONTRAT', 'Éléctroniquement valider et signer le contrat'],
                ['ENREGISTRER_EXECUTION', "Saisir les détails de la livraison/exécution d'un marché"],
                ['VALIDER_RECEPTION', "Confirmer que les articles livrés sont conformes (PV)"],
                ['VOIR_RECEPTIONS', "Consulter l'historique des réceptions"],
                ['EFFECTUER_PAIEMENT', "Ordonner le paiement final d'un marché réceptionné"],
                ['VOIR_PAIEMENTS', "Consulter l'historique des paiements effectués"]
            ];
            for (const [code, desc] of allPermsData) {
                await connection.query(
                    'INSERT IGNORE INTO permission (codePermission, description) VALUES (?, ?)',
                    [code, desc]
                );
            }
            console.log('✅ Permissions système synchronisées');

            // Auto-assigner les permissions par défaut à chaque rôle
            // Les clés correspondent aux nomRole exacts en base (insensible à la casse)
            const rolePermMap = {
                // ADMIN: uniquement gestion utilisateurs, rôles/permissions, services, articles
                'Admin': [
                    // Gestion utilisateurs & droits
                    'GERER_UTILISATEURS',
                    'VOIR_UTILISATEURS',
                    'GERER_ROLES_PERMISSIONS',

                    // Paramétrage
                    'GERER_SERVICES',
                    'GERER_ARTICLES'
                ],
                'raf': [
                    'VALIDER_BUDGET_DEMANDE', 'GERER_BUDGETS', 'VOIR_BUDGETS',
                    'EFFECTUER_PAIEMENT', 'VOIR_PAIEMENTS', 'VOIR_TOUTES_DEMANDES',
                    'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'MODIFIER_DEMANDE',
                    'DEMANDE_CREATE', 'DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'DEMANDE_UPDATE'
                ],
                'Chef service': [
                    'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'MODIFIER_DEMANDE', 'SUPPRIMER_DEMANDE',
                    'DEMANDE_CREATE', 'DEMANDE_READ_OWN', 'DEMANDE_UPDATE', 'DEMANDE_DELETE'
                ],
                'Chef_institution': [
                    'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'MODIFIER_DEMANDE', 'SUPPRIMER_DEMANDE',
                    'VOIR_STATISTIQUES', 'VALIDER_CONTRAT', 'VOIR_TOUTES_DEMANDES',
                    'DEMANDE_CREATE', 'DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'DEMANDE_UPDATE', 'DEMANDE_DELETE'
                ],
                'cgmp': [
                    'VOIR_TOUTES_DEMANDES', 'AJUSTER_DEMANDE_CGMP',
                    'GERER_MARCHES', 'VOIR_MARCHES', 'GERER_SOUMISSIONS',
                    'CREER_CONTRAT', 'VOIR_BUDGETS',
                    'DEMANDE_READ_ALL'
                ],
                'Receptioniste': [
                    'ENREGISTRER_EXECUTION', 'VALIDER_RECEPTION', 'VOIR_RECEPTIONS',
                    'GERER_SOUMISSIONS', 'VOIR_MARCHES',
                    'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'MODIFIER_DEMANDE', 'SUPPRIMER_DEMANDE',
                    'DEMANDE_CREATE', 'DEMANDE_READ_OWN', 'DEMANDE_UPDATE', 'DEMANDE_DELETE'
                ]
            };

            const normalizeRoleName = (name) =>
                name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ');

            const [allRoles] = await connection.query('SELECT idRole, nomRole FROM role');
            for (const dbRole of allRoles) {
                const normalizedDb = normalizeRoleName(dbRole.nomRole);
                const matchedEntry = Object.entries(rolePermMap).find(
                    ([roleName]) => normalizeRoleName(roleName) === normalizedDb
                );
                if (!matchedEntry) continue;

                const [, permCodes] = matchedEntry;
                // Re-synchroniser exactement les permissions par défaut du rôle
                await connection.query(
                    'DELETE FROM role_permission WHERE idRole = ?',
                    [dbRole.idRole]
                );
                const [perms] = await connection.query(
                    'SELECT idPermission FROM permission WHERE codePermission IN (?)', [permCodes]
                );
                for (const perm of perms) {
                    await connection.query(
                        'INSERT IGNORE INTO role_permission (idRole, idPermission) VALUES (?, ?)',
                        [dbRole.idRole, perm.idPermission]
                    );
                }
            }
            console.log('✅ Permissions par défaut assignées à tous les rôles');
        } catch (err) {
            console.error('❌ Erreur système de permissions:', err.message);
        }
        // --- FIN DU SYSTÈME DE PERMISSIONS ---
        
        connection.release(); // On libère la connexion après le test
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à la base de données :', err.message);
    });

module.exports = pool;

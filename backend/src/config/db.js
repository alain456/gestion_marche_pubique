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
        
        connection.release(); // On libère la connexion après le test
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à la base de données :', err.message);
    });

module.exports = pool;

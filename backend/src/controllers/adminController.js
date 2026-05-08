const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // Récupère le nombre total d'utilisateurs
        const [usersResult] = await db.query('SELECT COUNT(*) as total FROM utilisateur');
        
        // Récupère le nombre de rôles distincts (ex: ADMIN, CGMP, RAF)
        const [rolesResult] = await db.query('SELECT COUNT(DISTINCT role) as total FROM utilisateur');

        res.json({
            totalUsers: usersResult[0].total,
            activeRoles: rolesResult[0].total
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des stats admin:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques." });
    }
};
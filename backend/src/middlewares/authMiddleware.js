const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware pour vérifier le token JWT
exports.verifyToken = async (req, res, next) => {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    // Le token est généralement au format "Bearer TOKEN_STRING"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Format de token invalide." });
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Sécurité : Vérifier si l'ID utilisateur existe (supporte 'id' et 'idUser')
        const userId = decoded.idUser || decoded.id;

        if (!userId) {
            console.error("Payload JWT manquant: identifiant non trouvé.", decoded);
            return res.status(403).json({ message: "Token malformé : identifiant manquant." });
        }

        // Vérifier si l'utilisateur existe et récupérer ses infos (rôle, service, activité)
        const query = `
            SELECT u.est_actif, u.idService, r.nomRole as role
            FROM utilisateur u
            JOIN role r ON u.idRole = r.idRole
            WHERE u.idUser = ?
        `;
        const [rows] = await db.query(query, [userId]);
        
        if (rows.length === 0 || rows[0].est_actif === 0) {
            return res.status(403).json({ message: "Votre compte est inactif ou inexistant." });
        }

        // Attacher les informations fraîches à l'objet request
        // Normalisation du rôle pour correspondre aux vérifications (RAF, ADMIN, CHEF_SERVICE, etc.)
        const normalizedRole = rows[0].role.trim().toUpperCase().replace(/\s+/g, '_');
        
        console.log(`[AUTH] User: ${userId}, DB Role: "${rows[0].role}", Normalized: "${normalizedRole}"`);

        req.user = {
            idUser: userId,
            role: normalizedRole,
            idService: rows[0].idService
        };
        
        next();
    } catch (error) {
        console.error("Erreur AuthMiddleware:", error.message);
        const status = error.name === 'TokenExpiredError' ? 401 : 403;
        res.status(status).json({ message: error.name === 'TokenExpiredError' ? "Session expirée." : "Token invalide." });
    }
};

// Middleware pour vérifier si l'utilisateur a le rôle 'Admin'
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toUpperCase() === 'ADMIN') {
        next(); // L'utilisateur est un admin, passer à la suite
    } else {
        res.status(403).json({ message: "Accès refusé. Seuls les administrateurs sont autorisés." });
    }
};

// Middleware pour autoriser plusieurs rôles (optionnel, mais utile)
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log(`[AUTH] Checking Role: "${req.user?.role}", Allowed: ${JSON.stringify(allowedRoles)}`);
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            console.warn(`[AUTH] Access Denied for role: "${req.user?.role}"`);
            return res.status(403).json({ message: "Accès refusé. Vous n'avez pas les permissions nécessaires." });
        }
        next();
    };
};
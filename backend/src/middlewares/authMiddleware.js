const jwt = require('jsonwebtoken');
const db = require('../config/db');

const isAdminUser = (user) =>
    user?.role && user.role.toUpperCase().replace(/\s+/g, '_') === 'ADMIN';

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
            SELECT u.nom, u.est_actif, u.idService, r.idRole, r.nomRole as role
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
        
        // Récupérer les permissions du rôle et les permissions spécifiques de l'utilisateur
        const [permRows] = await db.query(`
            SELECT p.codePermission
            FROM permission p
            JOIN role_permission rp ON p.idPermission = rp.idPermission
            WHERE rp.idRole = ?
              AND NOT EXISTS (
                  SELECT 1
                  FROM utilisateur_permission up
                  WHERE up.idUser = ?
                    AND up.idPermission = p.idPermission
                    AND up.typePermission = 'REVOKE'
              )
            UNION
            SELECT p.codePermission
            FROM permission p
            JOIN utilisateur_permission up ON p.idPermission = up.idPermission
            WHERE up.idUser = ?
              AND up.typePermission = 'GRANT'
        `, [rows[0].idRole, userId, userId]);
        const permissions = permRows.map(row => row.codePermission);

        console.log(`[AUTH] User: ${userId}, Name: ${rows[0].nom}, DB Role: "${rows[0].role}", Permissions: [${permissions.join(', ')}]`);

        req.user = {
            idUser: userId,
            nom: rows[0].nom,
            role: normalizedRole,
            idRole: rows[0].idRole,
            idService: rows[0].idService,
            permissions: permissions
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
    if (isAdminUser(req.user)) {
        next();
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

// Middleware basé sur les permissions (accepte une chaîne ou un tableau)
exports.requirePermission = (permissionCode) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: "Accès refusé. Permission insuffisante." });
        }

        const permsToCheck = Array.isArray(permissionCode) ? permissionCode : [permissionCode];
        const hasAtLeastOne = permsToCheck.some(p => req.user.permissions.includes(p));

        if (!hasAtLeastOne) {
            console.warn(`[AUTH] Access Denied. Missing one of: [${permsToCheck.join(', ')}] for user ${req.user?.idUser}`);
            return res.status(403).json({ message: "Accès refusé. Permission insuffisante." });
        }
        next();
    };
};

// Autoriser si ADMIN ou si permission présente
exports.requireAdminOrPermission = (permissionCode) => {
    return (req, res, next) => {
        if (isAdminUser(req.user)) {
            return next();
        }

        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: "Accès refusé. Permission insuffisante." });
        }

        const permsToCheck = Array.isArray(permissionCode) ? permissionCode : [permissionCode];
        const hasAtLeastOne = permsToCheck.some(p => req.user.permissions.includes(p));

        if (!hasAtLeastOne) {
            return res.status(403).json({ message: "Accès refusé. Permission insuffisante." });
        }
        next();
    };
};

exports.isAdminUser = isAdminUser;
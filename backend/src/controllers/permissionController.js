const db = require('../config/db');

const fetchUserPermissionDetail = async (idUser) => {
    const [users] = await db.query(`
        SELECT u.idUser, u.nom, u.email, u.idRole, u.est_actif, r.nomRole
        FROM utilisateur u
        JOIN role r ON u.idRole = r.idRole
        WHERE u.idUser = ?
    `, [idUser]);

    if (users.length === 0) {
        return null;
    }

    const user = users[0];

    const [rolePermissions] = await db.query(`
        SELECT p.*
        FROM permission p
        JOIN role_permission rp ON p.idPermission = rp.idPermission
        WHERE rp.idRole = ?
        ORDER BY p.idPermission ASC
    `, [user.idRole]);

    const [grantedPermissions] = await db.query(`
        SELECT p.*
        FROM permission p
        JOIN utilisateur_permission up ON p.idPermission = up.idPermission
        WHERE up.idUser = ?
          AND up.typePermission = 'GRANT'
        ORDER BY p.idPermission ASC
    `, [idUser]);

    const [revokedPermissions] = await db.query(`
        SELECT p.*
        FROM permission p
        JOIN utilisateur_permission up ON p.idPermission = up.idPermission
        WHERE up.idUser = ?
          AND up.typePermission = 'REVOKE'
        ORDER BY p.idPermission ASC
    `, [idUser]);

    const rolePermissionIds = rolePermissions.map(p => p.idPermission);
    const userPermissionIds = grantedPermissions.map(p => p.idPermission);
    const revokedPermissionIds = revokedPermissions.map(p => p.idPermission);
    const effectivePermissionIds = [
        ...new Set([
            ...rolePermissionIds.filter(id => !revokedPermissionIds.includes(id)),
            ...userPermissionIds
        ])
    ];

    return {
        user,
        rolePermissions,
        userPermissions: grantedPermissions,
        revokedPermissions,
        rolePermissionIds,
        userPermissionIds,
        revokedPermissionIds,
        effectivePermissionIds
    };
};

// Récupérer toutes les permissions disponibles dans le système
exports.getAllPermissions = async (req, res) => {
    try {
        const [permissions] = await db.query('SELECT * FROM permission ORDER BY idPermission ASC');
        res.status(200).json(permissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des permissions :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des permissions." });
    }
};

// Créer une permission
exports.createPermission = async (req, res) => {
    const { codePermission, description } = req.body;
    if (!codePermission || !codePermission.trim()) {
        return res.status(400).json({ message: "Le codePermission est requis." });
    }

    const normalizedCode = codePermission.trim().toUpperCase();
    try {
        const [result] = await db.query(
            'INSERT INTO permission (codePermission, description) VALUES (?, ?)',
            [normalizedCode, description || null]
        );
        res.status(201).json({
            message: "Permission créée avec succès.",
            idPermission: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Ce codePermission existe déjà." });
        }
        console.error("Erreur lors de la création de la permission :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la création de la permission." });
    }
};

// Mettre à jour une permission
exports.updatePermission = async (req, res) => {
    const { idPermission } = req.params;
    const { codePermission, description } = req.body;
    if (!codePermission || !codePermission.trim()) {
        return res.status(400).json({ message: "Le codePermission est requis." });
    }

    const normalizedCode = codePermission.trim().toUpperCase();
    try {
        const [result] = await db.query(
            'UPDATE permission SET codePermission = ?, description = ? WHERE idPermission = ?',
            [normalizedCode, description || null, idPermission]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permission non trouvée." });
        }
        res.status(200).json({ message: "Permission mise à jour avec succès." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Ce codePermission existe déjà." });
        }
        console.error("Erreur lors de la mise à jour de la permission :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la permission." });
    }
};

// Supprimer une permission
exports.deletePermission = async (req, res) => {
    const { idPermission } = req.params;
    try {
        const [result] = await db.query('DELETE FROM permission WHERE idPermission = ?', [idPermission]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permission non trouvée." });
        }
        res.status(200).json({ message: "Permission supprimée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de la permission :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la suppression de la permission." });
    }
};

// Récupérer les permissions assignées à un rôle spécifique
exports.getRolePermissions = async (req, res) => {
    const { idRole } = req.params;
    try {
        const query = `
            SELECT p.* 
            FROM permission p
            JOIN role_permission rp ON p.idPermission = rp.idPermission
            WHERE rp.idRole = ?
        `;
        const [permissions] = await db.query(query, [idRole]);
        res.status(200).json(permissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des permissions du rôle :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des permissions du rôle." });
    }
};

// Assigner ou mettre à jour les permissions pour un rôle
exports.updateRolePermissions = async (req, res) => {
    const { idRole } = req.params;
    const { permissionIds } = req.body; // Un tableau d'IDs de permissions

    if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ message: "Format invalide. 'permissionIds' doit être un tableau." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Supprimer toutes les permissions existantes pour ce rôle
        await connection.query('DELETE FROM role_permission WHERE idRole = ?', [idRole]);

        // 2. Insérer les nouvelles permissions si le tableau n'est pas vide
        if (permissionIds.length > 0) {
            const values = permissionIds.map(idPerm => [idRole, idPerm]);
            await connection.query('INSERT INTO role_permission (idRole, idPermission) VALUES ?', [values]);
        }

        await connection.commit();
        res.status(200).json({ message: "Permissions du rôle mises à jour avec succès." });
    } catch (error) {
        await connection.rollback();
        console.error("Erreur lors de la mise à jour des permissions du rôle :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour des permissions." });
    } finally {
        connection.release();
    }
};

// Récupérer les permissions spécifiques assignées à un utilisateur
exports.getUserPermissions = async (req, res) => {
    const { idUser } = req.params;
    try {
        const detail = await fetchUserPermissionDetail(idUser);
        if (!detail) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.status(200).json(detail.userPermissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des permissions de l'utilisateur :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des permissions de l'utilisateur." });
    }
};

// Détail complet : permissions du rôle + individuelles + effectives
exports.getUserPermissionsDetail = async (req, res) => {
    const { idUser } = req.params;
    try {
        const detail = await fetchUserPermissionDetail(idUser);
        if (!detail) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.status(200).json(detail);
    } catch (error) {
        console.error("Erreur lors de la récupération du détail des permissions :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du détail des permissions." });
    }
};

// Assigner ou mettre à jour les permissions spécifiques pour un utilisateur
exports.updateUserPermissions = async (req, res) => {
    const { idUser } = req.params;
    const { effectivePermissionIds } = req.body;

    if (!Array.isArray(effectivePermissionIds)) {
        return res.status(400).json({ message: "Format invalide. 'effectivePermissionIds' doit être un tableau." });
    }

    const connection = await db.getConnection();
    try {
        const [users] = await connection.query(
            'SELECT idUser, idRole FROM utilisateur WHERE idUser = ? LIMIT 1',
            [idUser]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        if (effectivePermissionIds.length > 0) {
            const [validPerms] = await connection.query(
                'SELECT idPermission FROM permission WHERE idPermission IN (?)',
                [effectivePermissionIds]
            );
            if (validPerms.length !== effectivePermissionIds.length) {
                return res.status(400).json({ message: "Une ou plusieurs permissions sont invalides." });
            }
        }

        const [roleRows] = await connection.query(
            'SELECT idPermission FROM role_permission WHERE idRole = ?',
            [users[0].idRole]
        );
        const rolePermissionIds = roleRows.map(row => row.idPermission);
        const effectiveSet = new Set(effectivePermissionIds);
        const roleSet = new Set(rolePermissionIds);

        const grantedPermissionIds = effectivePermissionIds.filter(id => !roleSet.has(id));
        const revokedPermissionIds = rolePermissionIds.filter(id => !effectiveSet.has(id));

        await connection.beginTransaction();

        await connection.query('DELETE FROM utilisateur_permission WHERE idUser = ?', [idUser]);

        if (grantedPermissionIds.length > 0) {
            const grantedValues = grantedPermissionIds.map(idPerm => [idUser, idPerm, 'GRANT']);
            await connection.query(
                'INSERT INTO utilisateur_permission (idUser, idPermission, typePermission) VALUES ?',
                [grantedValues]
            );
        }

        if (revokedPermissionIds.length > 0) {
            const revokedValues = revokedPermissionIds.map(idPerm => [idUser, idPerm, 'REVOKE']);
            await connection.query(
                'INSERT INTO utilisateur_permission (idUser, idPermission, typePermission) VALUES ?',
                [revokedValues]
            );
        }

        await connection.commit();

        const detail = await fetchUserPermissionDetail(idUser);
        res.status(200).json({
            message: "Permissions individuelles mises à jour avec succès.",
            ...detail
        });
    } catch (error) {
        try {
            await connection.rollback();
        } catch (_) {
            /* transaction may not have started */
        }
        console.error("Erreur lors de la mise à jour des permissions de l'utilisateur :", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour des permissions de l'utilisateur." });
    } finally {
        connection.release();
    }
};

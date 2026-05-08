const User = require('../models/userModel');
const bcrypt = require('bcrypt');



//creer un utilisateur
exports.createUser = async (req, res) => {
    const { nom, email, password, idRole, idService } = req.body;
    
    if(!nom || !email || !password || !idRole){
        return res.status(400).json({ message: "Veuillez fournir un nom, un email, un mot de passe et un role" });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        await User.create({ nom, email, password: hash, idRole, idService: idService || null });
        res.json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// modifier un utilisateur
exports.updateUser = async (req, res) => {
    const { idUser, nom, email, password, idRole, idService } = req.body;
    
    if(!idUser || !nom || !email || !idRole){
        return res.status(400).json({ message: "Veuillez fournir un id, un nom, un email et un role" });
    }

    try {
        let data = { nom, email, idRole, idService: idService || null };
        
        // Si un mot de passe est fourni, on le hache et on l'ajoute aux données à mettre à jour
        if (password && password.trim() !== "") {
            const hash = await bcrypt.hash(password, 10);
            data.password = hash;
        }

        await User.update(idUser, data);
        res.json({ message: "Utilisateur modifié avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

//supprimer un utilisateur

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

//get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Activer/Désactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.toggleStatus(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ message: "Statut de l'utilisateur modifié avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Créer un rôle
exports.createRole = async (req, res) => {
    const { nomRole } = req.body;
    if (!nomRole) {
        return res.status(400).json({ message: "Veuillez fournir un nom de role" });
    }
    try {
        await User.createRole(nomRole);
        res.json({ message: "Role créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la création du rôle" });
    }
};

// Modifier un rôle
exports.updateRole = async (req, res) => {
    const { idRole, nomRole } = req.body;
    if (!idRole || !nomRole) {
        return res.status(400).json({ message: "Veuillez fournir un id et un nom de role" });
    }
    try {
        await User.updateRole(idRole, nomRole);
        res.json({ message: "Role modifié avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

    // supprimer un role
    
    exports.deleteRole = async (req, res) => {
        const { idRole } = req.params;
        if(!idRole){
            return res.status(400).json({ message: "Veuillez fournir un id de role" });
        }
        try {
            await User.deleteRole(idRole);
            res.json({ message: "Role supprimé avec succès" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }

    // liste des tous les roles
    exports.getRoles = async (req, res) => {
    try {
        const roles = await User.findAllRoles();
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

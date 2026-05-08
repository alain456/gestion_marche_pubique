const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    
    if(!email || !password){
        return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
    }

    try {
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // Vérifier si le compte est actif
        if (user.est_actif === 0) {
            return res.status(403).json({ message: "Votre compte est inactif, consultez votre Administrateur" });
        }

        // Utiliser 'idUser' pour être cohérent avec le Middleware et la DB
        const token = jwt.sign(
            { idUser: user.idUser, role: user.nomRole }, 
            process.env.JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.json({ 
            token, 
            user: { 
                idUser: user.idUser, 
                nom: user.nom,
                email: user.email, 
                role: user.nomRole,
                idService: user.idService,
                nomService: user.nomService
            } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

//get profile

exports.getProfile = async (req, res) => {
    try {
        const idUser = req.user.idUser;
        const user = await User.findById(idUser);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

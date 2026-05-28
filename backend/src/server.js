const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importation de la connexion à la base de données
require('./config/db');

// Importation des routes
const marcheRoutes = require('./routes/marcheRoutes');
const demandeRoutes = require('./routes/demandeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const soumissionRoutes = require('./routes/soumissionRoutes'); 
const contratRoutes = require('./routes/contratRoutes');
const receptionRoutes = require('./routes/receptionRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json()); // Pour parser le JSON dans le corps des requêtes
app.use('/api/marches', marcheRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/soumissions', soumissionRoutes); 
app.use('/api/receptions', receptionRoutes);
app.use('/api/contrats', contratRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/permissions', permissionRoutes);

app.get('/api', (req, res) => {
    res.json({ message: "Bienvenue sur l'API de Gestion des Marchés Publics (SETIC) !" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

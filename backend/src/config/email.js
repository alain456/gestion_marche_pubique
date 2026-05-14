const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // votre email
        pass: process.env.EMAIL_PASS, // votre mot de passe d'application
    },
});

const sendEmail = async (to, subject, text) => {
    console.log(`📧 Tentative d'envoi d'email à : ${to}...`);
    
    let currentTransporter = transporter;

    // Si aucune config n'est présente, on utilise un compte de test Ethereal (pour le développement)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("🛠️ Mode test activé (aucune config SMTP trouvée dans .env)...");
        const testAccount = await nodemailer.createTestAccount();
        currentTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    try {
        const info = await currentTransporter.sendMail({
            from: `"SETIC - Gestion des Marchés" <${process.env.EMAIL_USER || 'test@example.com'}>`,
            to,
            subject,
            text,
        });

        console.log('✅ Email envoyé !');
        
        // Si on est en mode test, on affiche l'URL pour voir l'email
        if (!process.env.EMAIL_USER) {
            console.log('🔗 Voir l\'email envoyé ici : %s', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
        throw error;
    }
};

module.exports = sendEmail;

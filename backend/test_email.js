const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log('Testing with User:', process.env.EMAIL_USER);

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Connection error:', error);
    } else {
        console.log('✅ Server is ready to take our messages');
    }
});

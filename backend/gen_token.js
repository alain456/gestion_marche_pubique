const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
    { idUser: 8, role: 'raf' }, 
    process.env.JWT_SECRET, 
    { expiresIn: "24h" }
);

console.log(token);

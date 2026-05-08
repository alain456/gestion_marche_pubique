const request = require('supertest');
const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Mock des dépendances
jest.mock('../models/userModel');
jest.mock('bcrypt');

const app = express();
app.use(express.json());

// Route temporaire pour le test du controller
app.post('/login', authController.login);

describe('Auth Controller - Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('devrait retourner 400 si l\'email ou le mot de passe est manquant', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Veuillez fournir un email et un mot de passe");
    });

    it('devrait retourner 401 si l\'utilisateur n\'existe pas', async () => {
        User.findByEmail.mockResolvedValue(null);

        const res = await request(app)
            .post('/login')
            .send({ email: 'inconnu@test.com', password: 'password123' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Email ou mot de passe incorrect");
    });

    it('devrait retourner 403 si l\'utilisateur est inactif', async () => {
        const mockInactiveUser = {
            idUser: 2,
            email: 'inactif@test.com',
            password: 'hashedPassword',
            est_actif: 0
        };

        User.findByEmail.mockResolvedValue(mockInactiveUser);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/login')
            .send({ email: 'inactif@test.com', password: 'password123' });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe("Votre compte est inactif, consultez votre Administrateur");
    });

    it('devrait retourner un token si les identifiants sont corrects', async () => {
        const mockUser = {
            idUser: 1,
            email: 'admin@test.com',
            password: 'hashedPassword',
            nomRole: 'Admin'
        };

        User.findByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        process.env.JWT_SECRET = 'testsecret';

        const res = await request(app)
            .post('/login')
            .send({ email: 'admin@test.com', password: 'password123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toBe('Admin');
    });
});
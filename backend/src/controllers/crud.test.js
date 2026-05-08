const request = require('supertest');
const express = require('express');
const userController = require('../controllers/userController');
const serviceController = require('../controllers/serviceDemandeurController');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');

// Mock des modèles pour ne pas toucher à la base de données réelle pendant le test
jest.mock('../models/userModel');
jest.mock('../models/serviceModel');
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const app = express();
app.use(express.json());

// Routes pour le test
app.post('/users', userController.createUser);
app.get('/users', userController.getAllUsers);
app.post('/roles', userController.createRole);
app.get('/roles', userController.getRoles);
app.post('/services', serviceController.createServiceDemandeur);
app.put('/services', serviceController.updateServiceDemandeur);

describe('Tests CRUD - Utilisateurs, Rôles et Services', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Test Rôles ---
    describe('CRUD Rôles', () => {
        it('devrait créer un nouveau rôle', async () => {
            User.createRole.mockResolvedValue({ insertId: 1 });
            const res = await request(app)
                .post('/roles')
                .send({ nomRole: 'Comptable' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("Role créé avec succès");
            expect(User.createRole).toHaveBeenCalledWith('Comptable');
        });

        it('devrait lister tous les rôles', async () => {
            User.findAllRoles.mockResolvedValue([{ idRole: 1, nomRole: 'Admin' }]);
            const res = await request(app).get('/roles');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body[0].nomRole).toBe('Admin');
        });
    });

    // --- Test Services Demandeurs ---
    describe('CRUD Services Demandeurs', () => {
        it('devrait créer un service', async () => {
            Service.create.mockResolvedValue({ insertId: 10 });
            const res = await request(app)
                .post('/services')
                .send({ nomService: 'Informatique' });

            expect(res.statusCode).toEqual(201);
            expect(res.body.idService).toBe(10);
        });

        it('devrait modifier un service existant', async () => {
            Service.update.mockResolvedValue({ affectedRows: 1 });
            const res = await request(app)
                .put('/services')
                .send({ idService: 10, nomService: 'IT & Digital' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("Service modifié avec succès.");
        });
    });

    // --- Test Utilisateurs ---
    describe('CRUD Utilisateurs', () => {
        it('devrait créer un utilisateur avec un mot de passe haché', async () => {
            User.create.mockResolvedValue({ insertId: 1 });
            const res = await request(app)
                .post('/users')
                .send({
                    nom: 'Jean Dupont',
                    email: 'jean@test.com',
                    password: 'password123',
                    idRole: 1
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("Utilisateur créé avec succès");
            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                nom: 'Jean Dupont',
                password: 'hashed_password'
            }));
        });

        it('devrait retourner une erreur si des champs manquent', async () => {
            const res = await request(app)
                .post('/users')
                .send({ nom: 'Incomplet' });
            expect(res.statusCode).toEqual(400);
        });
    });
});
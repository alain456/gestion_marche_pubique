jest.mock('../models/budgetModel', () => ({
    createValidation: jest.fn()
}));
jest.mock('../models/demandeModel', () => ({
    addHistory: jest.fn()
}));
jest.mock('../models/parametreModel', () => ({
    getByType: jest.fn()
}));

const Budget = require('../models/budgetModel');
const Demande = require('../models/demandeModel');
const controller = require('./budgetController');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('bulk budget validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('continues after an individual validation failure and returns each result', async () => {
        Budget.createValidation
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(new Error('Demande déjà traitée'))
            .mockResolvedValueOnce(true);
        Demande.addHistory.mockResolvedValue(true);
        const req = {
            body: { idDemandes: [11, 12, 13], motif: 'Validation' },
            user: { idUser: 3, nom: 'RAF', role: 'RAF' }
        };
        const res = createResponse();
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        await controller.bulkValiderBudget(req, res);

        expect(Budget.createValidation).toHaveBeenCalledTimes(3);
        expect(Demande.addHistory).toHaveBeenCalledTimes(2);
        expect(res.json).toHaveBeenCalledWith({
            message: '2 demande(s) validée(s) sur 3.',
            results: [
                { idDemande: 11, success: true, message: 'Validée avec succès.' },
                { idDemande: 12, success: false, message: 'La validation a échoué. Vérifiez la demande puis réessayez.' },
                { idDemande: 13, success: true, message: 'Validée avec succès.' }
            ]
        });
        consoleError.mockRestore();
    });

    it('rejects invalid IDs without attempting validation', async () => {
        const req = { body: { idDemandes: [1, 'not-an-id'] }, user: { nom: 'RAF' } };
        const res = createResponse();

        await controller.bulkValiderBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Budget.createValidation).not.toHaveBeenCalled();
    });

    it('normalizes duplicate numeric IDs before validating', async () => {
        Budget.createValidation.mockResolvedValue(true);
        Demande.addHistory.mockResolvedValue(true);
        const req = {
            body: { idDemandes: [11, '11'] },
            user: { idUser: 3, nom: 'RAF', role: 'RAF' }
        };
        const res = createResponse();

        await controller.bulkValiderBudget(req, res);

        expect(Budget.createValidation).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            message: '1 demande(s) validée(s) sur 1.',
            results: [{ idDemande: 11, success: true, message: 'Validée avec succès.' }]
        });
    });
});

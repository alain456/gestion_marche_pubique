jest.mock('../models/echeanceAlertModel', () => ({
    getThresholds: jest.fn(),
    getAlerts: jest.fn(),
    updateThresholds: jest.fn()
}));

const echeanceAlertModel = require('../models/echeanceAlertModel');
const controller = require('./echeanceAlertController');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('echeance alert controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns alerts and effective thresholds for the authenticated user', async () => {
        const thresholds = {
            demandeValidationJours: 5,
            marcheEcheanceJours: 3,
            paiementJours: 5
        };
        const req = {
            user: { idUser: 3, idService: 7, role: 'CHEF_SERVICE', permissions: ['DEMANDE_READ_OWN'] }
        };
        const res = createResponse();
        echeanceAlertModel.getThresholds.mockResolvedValue(thresholds);
        echeanceAlertModel.getAlerts.mockResolvedValue([{ id: 'demande-12' }]);

        await controller.getAlerts(req, res);

        expect(echeanceAlertModel.getAlerts).toHaveBeenCalledWith({
            user: req.user,
            permissions: req.user.permissions,
            thresholds
        });
        expect(res.json).toHaveBeenCalledWith({
            thresholds,
            alerts: [{ id: 'demande-12' }]
        });
    });

    it('rejects invalid threshold values before writing', async () => {
        const req = {
            body: {
                demandeValidationJours: 5,
                marcheEcheanceJours: -1,
                paiementJours: 400
            }
        };
        const res = createResponse();

        await controller.updateThresholds(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Chaque seuil doit être un nombre entier compris entre 0 et 365 jours.'
        });
        expect(echeanceAlertModel.updateThresholds).not.toHaveBeenCalled();
    });

    it('stores the three organization thresholds', async () => {
        const thresholds = {
            demandeValidationJours: 8,
            marcheEcheanceJours: 2,
            paiementJours: 6
        };
        const req = { body: thresholds };
        const res = createResponse();
        echeanceAlertModel.updateThresholds.mockResolvedValue(thresholds);

        await controller.updateThresholds(req, res);

        expect(echeanceAlertModel.updateThresholds).toHaveBeenCalledWith(thresholds);
        expect(res.json).toHaveBeenCalledWith({
            thresholds,
            message: 'Seuils de rappel enregistrés.'
        });
    });
});

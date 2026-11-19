jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const adminController = require('./adminController');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('admin dashboard metrics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('restricts a service chief to their own service and returns the filtered indicators', async () => {
        db.query
            .mockResolvedValueOnce([[{
                totalDemandes: 3,
                demandesEnAttente: 1,
                delaiMoyenJours: 2,
                budgetEngage: 1500
            }]])
            .mockResolvedValueOnce([[{ statut: 'Valide', total: 2 }]])
            .mockResolvedValueOnce([[{ statut: 'publie', total: 1 }]])
            .mockResolvedValueOnce([[{ idService: 7, nomService: 'Service local' }]]);
        const req = {
            user: {
                idUser: 12,
                idService: 7,
                role: 'CHEF_SERVICE',
                permissions: ['VOIR_STATISTIQUES']
            },
            query: { annee: '2026', service: '2', statut: 'Valide' }
        };
        const res = createResponse();

        await adminController.getDashboardMetrics(req, res);

        expect(db.query.mock.calls[0][0]).toContain('d.idService = ?');
        expect(db.query.mock.calls[0][1]).toEqual([7, 2026, 'Valide']);
        expect(db.query.mock.calls[2][1]).toEqual([7, 2026, 'Valide']);
        expect(db.query.mock.calls[3][1]).toEqual([7]);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            summary: expect.objectContaining({ totalDemandes: 3 }),
            canChooseAnyService: false,
            filters: { annee: 2026, service: 7, statut: 'Valide' }
        }));
    });

    it('allows a financial manager to filter across services', async () => {
        db.query
            .mockResolvedValueOnce([[{ totalDemandes: 0 }]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ idService: 1, nomService: 'Service 1' }]]);
        const req = {
            user: {
                idUser: 8,
                idService: null,
                role: 'RAF',
                permissions: ['VALIDER_BUDGET_DEMANDE']
            },
            query: { annee: 'tous', service: '1', statut: 'tous' }
        };
        const res = createResponse();

        await adminController.getDashboardMetrics(req, res);

        expect(db.query.mock.calls[0][1]).toEqual([1]);
        expect(db.query.mock.calls[3][1]).toEqual([]);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            canChooseAnyService: true,
            filters: { annee: null, service: 1, statut: null }
        }));
    });

    it('rejects invalid filters before querying the database', async () => {
        const req = {
            user: { idUser: 1, idService: null, role: 'ADMIN', permissions: [] },
            query: { annee: 'not-a-year', service: 'tous', statut: 'tous' }
        };
        const res = createResponse();

        await adminController.getDashboardMetrics(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Année invalide.' });
        expect(db.query).not.toHaveBeenCalled();
    });
});

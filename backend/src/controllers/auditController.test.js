jest.mock('../models/auditLogModel', () => ({
    findPage: jest.fn()
}));

const AuditLog = require('../models/auditLogModel');
const controller = require('./auditController');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('admin audit controller', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns a page of filtered audit entries', async () => {
        AuditLog.findPage.mockResolvedValue({
            entries: [{ idAudit: 5, methode: 'POST', entite: 'users' }],
            total: 26
        });
        const req = {
            query: { from: '2026-11-01', to: '2026-11-17', entity: 'users', page: '2', limit: '25' }
        };
        const res = createResponse();

        await controller.getAuditLog(req, res);

        expect(AuditLog.findPage).toHaveBeenCalledWith({
            from: '2026-11-01',
            to: '2026-11-17',
            userId: null,
            entity: 'users',
            method: null,
            search: null,
            limit: 25,
            offset: 25
        });
        expect(res.json).toHaveBeenCalledWith({
            entries: [{ idAudit: 5, methode: 'POST', entite: 'users' }],
            pagination: { page: 2, limit: 25, total: 26, totalPages: 2 }
        });
    });

    it('rejects invalid date ranges before querying', async () => {
        const req = { query: { from: '2026-11-18', to: '2026-11-17' } };
        const res = createResponse();

        await controller.getAuditLog(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'La date de début doit précéder la date de fin.'
        });
        expect(AuditLog.findPage).not.toHaveBeenCalled();
    });

    it('caps page size to prevent unbounded audit reads', async () => {
        const req = { query: { limit: '1000' } };
        const res = createResponse();

        await controller.getAuditLog(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(AuditLog.findPage).not.toHaveBeenCalled();
    });

    it('always scopes a personal activity query to the authenticated user', async () => {
        AuditLog.findPage.mockResolvedValue({ entries: [], total: 0 });
        const req = {
            user: { idUser: 12 },
            query: { userId: '4', entity: 'demandes', page: '1', limit: '25' }
        };
        const res = createResponse();

        await controller.getMyAuditLog(req, res);

        expect(AuditLog.findPage).toHaveBeenCalledWith({
            from: null,
            to: null,
            userId: 12,
            entity: 'demandes',
            method: null,
            search: null,
            limit: 25,
            offset: 0
        });
        expect(res.status).not.toHaveBeenCalled();
    });
});

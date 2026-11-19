jest.mock('../models/auditLogModel', () => ({
    record: jest.fn()
}));

const AuditLog = require('../models/auditLogModel');
const auditMiddleware = require('./auditMiddleware');

const createResponse = (statusCode = 200) => {
    const listeners = {};
    return {
        statusCode,
        once: jest.fn((event, callback) => {
            listeners[event] = callback;
        }),
        finish: () => listeners.finish?.()
    };
};

describe('audit middleware', () => {
    beforeEach(() => jest.clearAllMocks());

    it('records successful authenticated mutations without saving request data', async () => {
        AuditLog.record.mockResolvedValue();
        const req = {
            path: '/api/users/17',
            method: 'PUT',
            body: { password: 'should-not-be-saved', nom: 'Updated name' },
            ip: '127.0.0.1',
            user: { idUser: 3, nom: 'Admin', role: 'ADMIN' },
            get: jest.fn().mockReturnValue('test-agent')
        };
        const res = createResponse(200);
        const next = jest.fn();

        auditMiddleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        res.finish();
        await Promise.resolve();

        expect(AuditLog.record).toHaveBeenCalledWith({
            idUtilisateur: 3,
            nomUtilisateur: 'Admin',
            roleUtilisateur: 'ADMIN',
            methode: 'PUT',
            entite: 'users',
            idEntite: 17,
            route: '/api/users/17',
            codeHttp: 200,
            adresseIp: '127.0.0.1',
            agentUtilisateur: 'test-agent'
        });
        expect(JSON.stringify(AuditLog.record.mock.calls)).not.toContain('should-not-be-saved');
    });

    it('does not record failed or unauthenticated mutations', () => {
        const failedResponse = createResponse(500);
        auditMiddleware({
            path: '/api/users',
            method: 'POST',
            user: { idUser: 3 }
        }, failedResponse, jest.fn());
        failedResponse.finish();

        const unauthenticatedResponse = createResponse(201);
        auditMiddleware({
            path: '/api/auth/login',
            method: 'POST'
        }, unauthenticatedResponse, jest.fn());
        unauthenticatedResponse.finish();

        expect(AuditLog.record).not.toHaveBeenCalled();
    });

    it('does not intercept reads', () => {
        const res = createResponse();
        const next = jest.fn();

        auditMiddleware({ path: '/api/users', method: 'GET' }, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.once).not.toHaveBeenCalled();
    });
});

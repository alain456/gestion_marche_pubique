jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const AuditLog = require('./auditLogModel');

describe('audit log model', () => {
    beforeEach(() => jest.clearAllMocks());

    it('uses parameterized filters and bounded pagination for audit queries', async () => {
        db.query
            .mockResolvedValueOnce([[{ total: 1 }], []])
            .mockResolvedValueOnce([[{ idAudit: 2, route: '/api/users' }], []]);

        const result = await AuditLog.findPage({
            from: '2026-11-01',
            to: null,
            userId: 7,
            entity: 'users',
            method: 'PUT',
            search: '%',
            limit: 25,
            offset: 25
        });

        expect(db.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('SELECT COUNT(*) AS total FROM journal_audit'),
            ['2026-11-01 00:00:00', 7, 'users', 'PUT', '%%%', '%%%', '%%%']
        );
        expect(db.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('LIMIT ? OFFSET ?'),
            ['2026-11-01 00:00:00', 7, 'users', 'PUT', '%%%', '%%%', '%%%', 25, 25]
        );
        expect(result).toEqual({
            entries: [{ idAudit: 2, route: '/api/users' }],
            total: 1
        });
    });
});

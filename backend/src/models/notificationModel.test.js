jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const Notification = require('./notificationModel');

describe('Notification model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('limits service notifications to requests the user can see', async () => {
        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ unreadCount: '0' }]]);

        const result = await Notification.findForUser({
            idUser: 12,
            idService: 4,
            role: 'CHEF_SERVICE',
            permissions: []
        });

        expect(result).toEqual({ items: [], unreadCount: 0 });
        expect(db.query.mock.calls[1][0]).toContain('(d.idUser = ? OR d.idService = ?)');
        expect(db.query.mock.calls[1][1]).toEqual([12, 12, 12, 4, 30]);
    });

    it('keeps global request visibility limited to roles or permissions that have it', async () => {
        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ unreadCount: 0 }]]);

        await Notification.findForUser({
            idUser: 2,
            idService: null,
            role: 'RAF',
            permissions: []
        });

        expect(db.query.mock.calls[0][0]).not.toContain('d.idUser = ?');
        expect(db.query.mock.calls[0][1]).toEqual([2, 2, 30]);
    });

    it('does not mark an inaccessible history entry as read', async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const marked = await Notification.markAsRead(82, {
            idUser: 12,
            idService: 4,
            role: 'CHEF_SERVICE',
            permissions: []
        });

        expect(marked).toBe(false);
        expect(db.query.mock.calls[0][0]).toContain('(d.idUser = ? OR d.idService = ?)');
        expect(db.query.mock.calls[0][1]).toEqual([12, 82, 12, 12, 4]);
    });
});

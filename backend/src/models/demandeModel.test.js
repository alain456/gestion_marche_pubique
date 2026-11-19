jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const Demande = require('./demandeModel');

describe('Demande.findDemandes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('includes associated market numbers without duplicating request articles', async () => {
        db.query.mockResolvedValueOnce([[
            {
                idDemande: 41,
                marchesAssocies: '5,6',
                articles: null
            }
        ]]);

        const demandes = await Demande.findDemandes();

        expect(db.query.mock.calls[0][0]).toContain('GROUP_CONCAT(DISTINCT m.idMarche ORDER BY m.idMarche)');
        expect(db.query.mock.calls[0][0]).toContain('WHERE FIND_IN_SET(d.idDemande, m.idDemande) > 0');
        expect(db.query.mock.calls[0][0]).not.toContain('LEFT JOIN marche m');
        expect(demandes[0].marchesAssocies).toBe('5,6');
        expect(demandes[0].articles).toEqual([]);
    });
});

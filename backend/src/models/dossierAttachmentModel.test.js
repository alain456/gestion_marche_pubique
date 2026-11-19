jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const DossierAttachment = require('./dossierAttachmentModel');

describe('dossier attachment access', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows an owner to view their request attachments', async () => {
        db.query.mockResolvedValue([[{ idDemande: 4, idUser: 8, idService: 2 }], []]);

        await expect(DossierAttachment.canAccessEntity(
            'demande',
            4,
            { idUser: 8, idService: 2, role: 'DEMANDEUR', permissions: ['DEMANDE_READ_OWN'] },
            'view'
        )).resolves.toEqual({ exists: true, allowed: true });
    });

    it('does not expose another service’s request to an own-requests reader', async () => {
        db.query.mockResolvedValue([[{ idDemande: 4, idUser: 10, idService: 6 }], []]);

        await expect(DossierAttachment.canAccessEntity(
            'demande',
            4,
            { idUser: 8, idService: 2, role: 'CHEF_SERVICE', permissions: ['DEMANDE_READ_OWN'] },
            'view'
        )).resolves.toEqual({ exists: true, allowed: false });
    });

    it('allows a user to upload to their own request when they can create requests', async () => {
        db.query.mockResolvedValue([[{ idDemande: 4, idUser: 8, idService: 2 }], []]);

        await expect(DossierAttachment.canAccessEntity(
            'demande',
            4,
            { idUser: 8, idService: 2, role: 'DEMANDEUR', permissions: ['DEMANDE_CREATE'] },
            'upload'
        )).resolves.toEqual({ exists: true, allowed: true });
    });

    it('requires market management permission to upload to a market', async () => {
        db.query.mockResolvedValue([[{ idMarche: 5 }], []]);

        await expect(DossierAttachment.canAccessEntity(
            'marche',
            5,
            { idUser: 8, role: 'CGMP', permissions: ['VOIR_MARCHES'] },
            'upload'
        )).resolves.toEqual({ exists: true, allowed: false });
    });

    it('denies access to nonexistent dossiers', async () => {
        db.query.mockResolvedValue([[], []]);

        await expect(DossierAttachment.canAccessEntity(
            'paiement',
            999,
            { idUser: 8, permissions: ['VOIR_PAIEMENTS'] },
            'view'
        )).resolves.toEqual({ exists: false, allowed: false });
    });
});

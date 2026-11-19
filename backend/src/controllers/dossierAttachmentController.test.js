jest.mock('../models/dossierAttachmentModel', () => ({
    canAccessEntity: jest.fn(),
    listByEntity: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
}));

const fs = require('fs/promises');
const DossierAttachment = require('../models/dossierAttachmentModel');
const controller = require('./dossierAttachmentController');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    set: jest.fn(),
    download: jest.fn()
});

describe('dossier attachment controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects invalid dossier identifiers before querying permissions', async () => {
        const req = { params: { entityType: 'demande', entityId: '../1' } };
        const res = createResponse();
        const next = jest.fn();

        await controller.authorizeEntity('view')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(DossierAttachment.canAccessEntity).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('denies access when the user has no permission on the dossier', async () => {
        DossierAttachment.canAccessEntity.mockResolvedValue({ exists: true, allowed: false });
        const req = {
            params: { entityType: 'demande', entityId: '4' },
            user: { idUser: 8, permissions: [] }
        };
        const res = createResponse();
        const next = jest.fn();

        await controller.authorizeEntity('view')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a PDF filename whose content does not match the claimed type', async () => {
        const req = {
            attachmentEntity: { type: 'demande', id: 4 },
            user: { idUser: 8, nom: 'Agent' },
            file: {
                originalname: 'justificatif.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.from('not a PDF'),
                size: 9
            }
        };
        const res = createResponse();

        await controller.upload(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(DossierAttachment.create).not.toHaveBeenCalled();
    });

    it('stores a valid PDF as a private versioned attachment', async () => {
        const mkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
        const chmod = jest.spyOn(fs, 'chmod').mockResolvedValue(undefined);
        const writeFile = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        DossierAttachment.create.mockResolvedValue({ idPieceJointe: 12, version: 2 });
        const req = {
            attachmentEntity: { type: 'demande', id: 4 },
            user: { idUser: 8, nom: 'Agent' },
            file: {
                originalname: 'justificatif.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.from('%PDF-1.7 document body'),
                size: 22
            }
        };
        const res = createResponse();

        await controller.upload(req, res);

        expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('private_uploads'), {
            recursive: true,
            mode: 0o700
        });
        expect(chmod).toHaveBeenCalledWith(expect.stringContaining('private_uploads'), 0o700);
        expect(writeFile).toHaveBeenCalledWith(
            expect.stringMatching(/private_uploads\/[a-f0-9]{48}\.bin$/),
            req.file.buffer,
            { flag: 'wx', mode: 0o600 }
        );
        expect(DossierAttachment.create).toHaveBeenCalledWith(expect.objectContaining({
            typeDossier: 'demande',
            idDossier: 4,
            nomOriginal: 'justificatif.pdf',
            typeMime: 'application/pdf',
            idUser: 8
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Version 2 ajoutée.',
            attachment: { idPieceJointe: 12, version: 2 }
        });
        mkdir.mockRestore();
        chmod.mockRestore();
        writeFile.mockRestore();
    });
});

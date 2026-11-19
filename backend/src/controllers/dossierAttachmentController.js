const fs = require('fs/promises');
const path = require('path');
const DossierAttachment = require('../models/dossierAttachmentModel');

const privateUploadDir = path.resolve(__dirname, '../../private_uploads');
const supportedFormats = {
    '.pdf': { mime: 'application/pdf', signature: buffer => buffer.subarray(0, 5).toString() === '%PDF-' },
    '.png': { mime: 'image/png', signature: buffer => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
    '.jpg': { mime: 'image/jpeg', signature: buffer => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
    '.jpeg': { mime: 'image/jpeg', signature: buffer => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
    '.webp': { mime: 'image/webp', signature: buffer => buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP' },
    '.doc': { mime: 'application/msword', signature: buffer => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) },
    '.xls': { mime: 'application/vnd.ms-excel', signature: buffer => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) },
    '.docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', signature: buffer => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004' },
    '.xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', signature: buffer => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004' },
    '.odt': { mime: 'application/vnd.oasis.opendocument.text', signature: buffer => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004' },
    '.ods': { mime: 'application/vnd.oasis.opendocument.spreadsheet', signature: buffer => buffer.subarray(0, 4).toString() === 'PK\u0003\u0004' }
};

const getPositiveId = value => /^\d+$/.test(String(value)) && Number(value) > 0;

const authorizeEntity = action => async (req, res, next) => {
    const { entityType, entityId } = req.params;
    if (!['demande', 'marche', 'reception', 'paiement'].includes(entityType) || !getPositiveId(entityId)) {
        return res.status(400).json({ message: 'Type ou identifiant de dossier invalide.' });
    }

    try {
        const access = await DossierAttachment.canAccessEntity(entityType, Number(entityId), req.user, action);
        if (!access.exists) return res.status(404).json({ message: 'Dossier introuvable.' });
        if (!access.allowed) return res.status(403).json({ message: 'Vous ne pouvez pas accéder aux pièces de ce dossier.' });
        req.attachmentEntity = { type: entityType, id: Number(entityId) };
        next();
    } catch (error) {
        console.error('Erreur de vérification des droits sur les pièces jointes:', error);
        res.status(500).json({ message: 'Impossible de vérifier les droits sur ce dossier.' });
    }
};

exports.authorizeEntity = authorizeEntity;

exports.authorizeDownload = async (req, res, next) => {
    if (!getPositiveId(req.params.attachmentId)) {
        return res.status(400).json({ message: 'Identifiant de pièce jointe invalide.' });
    }
    try {
        const attachment = await DossierAttachment.findById(Number(req.params.attachmentId));
        if (!attachment) return res.status(404).json({ message: 'Pièce jointe introuvable.' });
        if (!['demande', 'marche', 'reception', 'paiement'].includes(attachment.typeDossier)) {
            return res.status(404).json({ message: 'Pièce jointe introuvable.' });
        }
        const access = await DossierAttachment.canAccessEntity(
            attachment.typeDossier,
            attachment.idDossier,
            req.user,
            'view'
        );
        if (!access.exists) return res.status(404).json({ message: 'Dossier introuvable.' });
        if (!access.allowed) return res.status(403).json({ message: 'Vous ne pouvez pas accéder à cette pièce jointe.' });
        req.attachment = attachment;
        next();
    } catch (error) {
        console.error('Erreur de vérification du téléchargement de pièce jointe:', error);
        res.status(500).json({ message: 'Impossible de vérifier les droits sur cette pièce jointe.' });
    }
};

exports.list = async (req, res) => {
    try {
        const rows = await DossierAttachment.listByEntity(req.attachmentEntity.type, req.attachmentEntity.id);
        res.json(rows);
    } catch (error) {
        console.error('Erreur de lecture des pièces jointes:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des pièces jointes.' });
    }
};

exports.upload = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Sélectionnez un fichier à ajouter.' });

    const extension = path.extname(req.file.originalname).toLowerCase();
    const format = supportedFormats[extension];
    if (!format || req.file.mimetype !== format.mime || !format.signature(req.file.buffer)) {
        return res.status(400).json({
            message: 'Format de fichier non accepté ou contenu invalide. Formats autorisés : PDF, DOC/DOCX, XLS/XLSX, ODT/ODS, JPG, PNG et WEBP.'
        });
    }

    const originalName = path.basename(req.file.originalname.replace(/\\/g, '/'))
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, 190);
    if (!originalName) return res.status(400).json({ message: 'Nom de fichier invalide.' });

    const storedName = `${require('crypto').randomBytes(24).toString('hex')}.bin`;
    const storedPath = path.join(privateUploadDir, storedName);
    try {
        await fs.mkdir(privateUploadDir, { recursive: true, mode: 0o700 });
        await fs.chmod(privateUploadDir, 0o700);
        await fs.writeFile(storedPath, req.file.buffer, { flag: 'wx', mode: 0o600 });
        const result = await DossierAttachment.create({
            typeDossier: req.attachmentEntity.type,
            idDossier: req.attachmentEntity.id,
            nomOriginal: originalName,
            nomStockage: storedName,
            typeMime: format.mime,
            tailleOctets: req.file.size,
            idUser: req.user.idUser,
            nomUtilisateur: req.user.nom
        });
        res.status(201).json({
            message: `Version ${result.version} ajoutée.`,
            attachment: { idPieceJointe: result.idPieceJointe, version: result.version }
        });
    } catch (error) {
        await fs.unlink(storedPath).catch(unlinkError => {
            if (unlinkError.code !== 'ENOENT') console.error('Erreur de nettoyage d’une pièce jointe:', unlinkError);
        });
        console.error('Erreur d’enregistrement de pièce jointe:', error);
        res.status(500).json({ message: 'Le fichier n’a pas pu être enregistré. Réessayez.' });
    }
};

exports.download = async (req, res) => {
    const attachment = req.attachment;
    const storedPath = path.join(privateUploadDir, path.basename(attachment.nomStockage));
    res.set({
        'Content-Type': 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': 'sandbox'
    });
    res.download(storedPath, attachment.nomOriginal, error => {
        if (!error) return;
        if (res.headersSent) {
            console.error('Erreur après le début du téléchargement:', error);
            return;
        }
        if (error.code === 'ENOENT') return res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });
        console.error('Erreur de téléchargement de pièce jointe:', error);
        res.status(500).json({ message: 'Le fichier n’a pas pu être téléchargé.' });
    });
};

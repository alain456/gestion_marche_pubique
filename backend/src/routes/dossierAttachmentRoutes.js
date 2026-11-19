const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/dossierAttachmentController');
const { verifyToken } = require('../middlewares/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});

const parseUpload = (req, res, next) => {
    upload.single('file')(req, res, error => {
        if (!error) return next();
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Le fichier ne doit pas dépasser 10 Mo.' });
        }
        return res.status(400).json({ message: 'Le fichier envoyé ne peut pas être traité.' });
    });
};

router.use(verifyToken);
router.get('/file/:attachmentId', controller.authorizeDownload, controller.download);
router.get('/:entityType/:entityId', controller.authorizeEntity('view'), controller.list);
router.post('/:entityType/:entityId', controller.authorizeEntity('upload'), parseUpload, controller.upload);

module.exports = router;

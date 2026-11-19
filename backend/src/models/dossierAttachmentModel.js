const db = require('../config/db');

const entityQueries = {
    demande: 'SELECT idDemande, idUser, idService FROM demande WHERE idDemande = ?',
    marche: 'SELECT idMarche FROM marche WHERE idMarche = ?',
    reception: 'SELECT idReception FROM reception WHERE idReception = ?',
    paiement: 'SELECT idPaiement FROM paiement WHERE idPaiement = ?'
};

const hasAnyPermission = (user, permissions) =>
    permissions.some(permission => user.permissions?.includes(permission));

const getEntity = async (type, id) => {
    const query = entityQueries[type];
    if (!query) return null;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
};

const canAccessEntity = async (type, id, user, action) => {
    const entity = await getEntity(type, id);
    if (!entity) return { exists: false, allowed: false };

    if (type !== 'demande') {
        const permissionSets = {
            marche: {
                view: ['VOIR_MARCHES', 'GERER_MARCHES'],
                upload: ['GERER_MARCHES']
            },
            reception: {
                view: ['VOIR_RECEPTIONS', 'VALIDER_RECEPTION', 'ENREGISTRER_EXECUTION', 'EFFECTUER_PAIEMENT', 'VOIR_PAIEMENTS'],
                upload: ['VALIDER_RECEPTION', 'ENREGISTRER_EXECUTION']
            },
            paiement: {
                view: ['VOIR_PAIEMENTS', 'EFFECTUER_PAIEMENT'],
                upload: ['EFFECTUER_PAIEMENT']
            }
        };
        return {
            exists: true,
            allowed: hasAnyPermission(user, permissionSets[type][action])
        };
    }

    const role = user.role?.toUpperCase();
    const globalRead = ['ADMIN', 'RAF', 'CGMP'].includes(role) ||
        hasAnyPermission(user, [
            'DEMANDE_READ_ALL', 'VOIR_TOUTES_DEMANDES', 'AJUSTER_DEMANDE_CGMP',
            'VALIDER_BUDGET_DEMANDE', 'VOIR_MARCHES', 'GERER_MARCHES'
        ]);
    const hasOwnRead = hasAnyPermission(user, ['DEMANDE_READ_OWN', 'VOIR_MES_DEMANDES']);
    const isReceptionRole = role === 'RECEPTIONNISTE' || role === 'RECEPTIONISTE';
    const isOwner = Number(entity.idUser) === Number(user.idUser);
    const sameService = !isReceptionRole &&
        entity.idService != null &&
        Number(entity.idService) === Number(user.idService);
    const inReadableScope = globalRead || (hasOwnRead && (isOwner || sameService));

    if (action === 'view') return { exists: true, allowed: inReadableScope };

    const canUpload = hasAnyPermission(user, [
        'DEMANDE_CREATE', 'CREER_DEMANDE', 'DEMANDE_UPDATE', 'MODIFIER_DEMANDE',
        'AJUSTER_DEMANDE_CGMP', 'VALIDER_BUDGET_DEMANDE'
    ]);
    const inWritableScope = globalRead ||
        ((isOwner || sameService) && canUpload);
    return { exists: true, allowed: canUpload && inWritableScope };
};

const DossierAttachment = {
    canAccessEntity,

    listByEntity: async (type, id) => {
        const [rows] = await db.query(
            `SELECT idPieceJointe, typeDossier, idDossier, nomOriginal, typeMime,
                    tailleOctets, version, idUser, nomUtilisateur, dateAjout
             FROM piece_jointe_dossier
             WHERE typeDossier = ? AND idDossier = ?
             ORDER BY nomOriginal ASC, version DESC`,
            [type, id]
        );
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(
            `SELECT idPieceJointe, typeDossier, idDossier, nomOriginal, nomStockage,
                    typeMime, tailleOctets, version, idUser, nomUtilisateur, dateAjout
             FROM piece_jointe_dossier
             WHERE idPieceJointe = ?`,
            [id]
        );
        return rows[0] || null;
    },

    create: async (attachment) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [existing] = await connection.query(
                `SELECT version
                 FROM piece_jointe_dossier
                 WHERE typeDossier = ? AND idDossier = ? AND nomOriginal = ?
                 ORDER BY version DESC
                 LIMIT 1
                 FOR UPDATE`,
                [attachment.typeDossier, attachment.idDossier, attachment.nomOriginal]
            );
            const version = (existing[0]?.version || 0) + 1;
            const [result] = await connection.query(
                `INSERT INTO piece_jointe_dossier
                    (typeDossier, idDossier, nomOriginal, nomStockage, typeMime,
                     tailleOctets, version, idUser, nomUtilisateur)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    attachment.typeDossier,
                    attachment.idDossier,
                    attachment.nomOriginal,
                    attachment.nomStockage,
                    attachment.typeMime,
                    attachment.tailleOctets,
                    version,
                    attachment.idUser,
                    attachment.nomUtilisateur
                ]
            );
            await connection.commit();
            return { idPieceJointe: result.insertId, version };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = DossierAttachment;

jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const echeanceAlertModel = require('./echeanceAlertModel');

describe('echeance alert model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('limits delayed request alerts to the user service when no global access exists', async () => {
        db.query.mockResolvedValueOnce([[
            {
                idDemande: 20,
                statut: 'En attente',
                dateDemande: '2026-11-01',
                joursAttente: 16,
                nomService: 'Service local',
                nomDemandeur: 'Utilisateur local'
            }
        ]]);

        const alerts = await echeanceAlertModel.getAlerts({
            user: { idUser: 3, idService: 7, role: 'CHEF_SERVICE' },
            permissions: ['DEMANDE_READ_OWN'],
            thresholds: {
                demandeValidationJours: 5,
                marcheEcheanceJours: 3,
                paiementJours: 5
            }
        });

        expect(db.query.mock.calls[0][0]).toContain("d.statut IN ('En attente', 'Soumis')");
        expect(db.query.mock.calls[0][0]).toContain('(d.idUser = ? OR d.idService = ?)');
        expect(db.query.mock.calls[0][1]).toEqual([5, 3, 7]);
        expect(alerts).toEqual([expect.objectContaining({
            id: 'demande-20',
            severity: 'urgent',
            days: 16
        })]);
    });

    it('shows outstanding receptions immediately and marks old ones overdue using the configured threshold', async () => {
        db.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[
                {
                    idReception: 12,
                    dateReception: '2026-11-10',
                    titulaireMarche: 'Prestataire',
                    joursAttente: 7
                }
            ]]);

        const alerts = await echeanceAlertModel.getAlerts({
            user: { idUser: 8, idService: null, role: 'RAF' },
            permissions: ['EFFECTUER_PAIEMENT'],
            thresholds: {
                demandeValidationJours: 5,
                marcheEcheanceJours: 3,
                paiementJours: 5
            }
        });

        expect(db.query.mock.calls[1][0]).toContain('LEFT JOIN paiement p');
        expect(alerts).toEqual([expect.objectContaining({
            id: 'paiement-12',
            severity: 'urgent',
            detail: expect.stringContaining('Prestataire')
        })]);
    });
});

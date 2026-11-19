jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const { getTimeline } = require('./demandeTimelineModel');

describe('Demand workflow timeline', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns the six workflow stages with recorded dates and owners', async () => {
        db.query
            .mockResolvedValueOnce([[
                {
                    idDemande: 41,
                    dateDemande: '2026-03-01 09:00:00',
                    statut: 'Inclus dans Marché',
                    dateValidation: '2026-03-02 10:00:00',
                    responsableFinancier: 'RAF One',
                    idUser: 3,
                    nomDemandeur: 'Demandeur One'
                }
            ]])
            .mockResolvedValueOnce([[
                {
                    action: 'Soumission de la demande',
                    nouveauStatut: 'Soumis',
                    nomUtilisateur: 'Demandeur One',
                    dateAction: '2026-03-01 09:00:00'
                },
                {
                    action: 'Validation Budgétaire (RAF)',
                    nouveauStatut: 'Valide',
                    nomUtilisateur: 'RAF One',
                    dateAction: '2026-03-02 10:00:00'
                }
            ]])
            .mockResolvedValueOnce([[
                { idMarche: 8, dateSelection: '2026-03-03', validateur: 'CGMP One', statut: 'publie' }
            ]])
            .mockResolvedValueOnce([[
                { idReception: 9, dateReception: '2026-03-04', typeReception: 'Définitive', conformite: 'Conforme', responsable: 'Agent réception' }
            ]])
            .mockResolvedValueOnce([[
                { idPaiement: 10, datePaiement: '2026-03-05', montant: 1000, responsable: 'Agent financier' }
            ]]);

        const timeline = await getTimeline(41, {
            idUser: 3,
            idService: 7,
            role: 'DEMANDEUR',
            permissions: ['VOIR_MES_DEMANDES']
        });

        expect(timeline.map(step => step.key)).toEqual([
            'draft', 'submitted', 'budget', 'market', 'reception', 'payment'
        ]);
        expect(timeline.find(step => step.key === 'submitted')).toMatchObject({
            status: 'completed',
            responsible: 'Demandeur One'
        });
        expect(timeline.find(step => step.key === 'budget')).toMatchObject({
            status: 'completed',
            responsible: 'RAF One'
        });
        expect(timeline.find(step => step.key === 'market')).toMatchObject({
            status: 'completed',
            responsible: 'CGMP One'
        });
        expect(timeline.find(step => step.key === 'payment')).toMatchObject({
            status: 'completed',
            responsible: 'Agent financier'
        });
        expect(timeline.find(step => step.key === 'reception').responsible).toBe('Agent réception');
        expect(db.query.mock.calls[0][1]).toEqual([41, 3, 7]);
    });

    it('does not return a timeline for a request outside the user service', async () => {
        db.query.mockResolvedValueOnce([[]]);

        const timeline = await getTimeline(41, {
            idUser: 3,
            idService: 7,
            role: 'CHEF_SERVICE',
            permissions: ['VOIR_MES_DEMANDES']
        });

        expect(timeline).toBeNull();
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0][0]).toContain('(d.idUser = ? OR d.idService = ?)');
    });

    it('marks a rejected demand at the budget step and does not advance it', async () => {
        db.query
            .mockResolvedValueOnce([[
                {
                    idDemande: 42,
                    dateDemande: '2026-04-01',
                    statut: 'Rejete',
                    idUser: 3,
                    nomDemandeur: 'Demandeur One'
                }
            ]])
            .mockResolvedValueOnce([[
                {
                    action: 'Rejet de la demande',
                    nouveauStatut: 'Rejete',
                    nomUtilisateur: 'RAF One',
                    dateAction: '2026-04-02'
                }
            ]])
            .mockResolvedValueOnce([[]]);

        const timeline = await getTimeline(42, {
            idUser: 1,
            idService: null,
            role: 'RAF',
            permissions: []
        });

        expect(timeline.find(step => step.key === 'budget')).toMatchObject({
            status: 'rejected',
            current: true,
            responsible: 'RAF One'
        });
        expect(timeline.find(step => step.key === 'market').current).toBe(false);
    });
});

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Search, 
  TrendingUp,
  Clock,
  Check,
  Package,
  PlusCircle
} from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const RafDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('demandes');
  const [demandes, setDemandes] = useState([]);
  const [receptions, setReceptions] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les modals/formulaires
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);

  const [budgetForm, setBudgetForm] = useState({
    exerciceBudgetaire: new Date().getFullYear(),
    montantEstime: '',
    motif: '',
    responsableFinancier: user?.nom || ''
  });

  const [paiementForm, setPaiementForm] = useState({
    montant: '',
    datePaiement: new Date().toISOString().split('T')[0]
  });

  const [tempArticles, setTempArticles] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demRes, recRes, paiRes] = await Promise.all([
        api.get('/demandes'),
        api.get('/receptions'),
        api.get('/paiements')
      ]);
      setDemandes(demRes.data);
      setReceptions(recRes.data);
      setPaiements(paiRes.data);
    } catch {
      console.error('Erreur chargement données RAF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBudgetModal = (demande) => {
    setSelectedDemande(demande);
    setTempArticles(demande.articles.map(a => ({ ...a, prixUnitaire: a.prixUnitaire || 0 })));
    const total = demande.articles.reduce((acc, a) => acc + ((a.prixUnitaire || 0) * a.quantite), 0);
    setBudgetForm({
      ...budgetForm,
      montantEstime: total || ''
    });
    setShowBudgetModal(true);
  };

  const updateArticlePrice = (idLigne, price) => {
    const updated = tempArticles.map(a => 
      a.idLigne === idLigne ? { ...a, prixUnitaire: parseFloat(price) || 0 } : a
    );
    setTempArticles(updated);
    const total = updated.reduce((acc, a) => acc + (a.prixUnitaire * a.quantite), 0);
    setBudgetForm({ ...budgetForm, montantEstime: total });
  };

  const handleBudgetSubmit = async (status) => {
    if (!budgetForm.motif || budgetForm.motif.trim() === '') {
      alert("Le motif ou la note est obligatoire pour valider ou rejeter une demande.");
      return;
    }

    if (status === 'valider' && (!budgetForm.montantEstime || budgetForm.montantEstime <= 0)) {
      alert("Veuillez saisir les prix des articles pour valider.");
      return;
    }

    try {
      const endpoint = status === 'valider' ? '/budgets/valider' : '/budgets/rejeter';
      await api.post(endpoint, {
        idDemande: selectedDemande.idDemande,
        exerciceBudgetaire: budgetForm.exerciceBudgetaire || new Date().getFullYear(),
        montantEstime: budgetForm.montantEstime || 0,
        motif: budgetForm.motif || '',
        articles: tempArticles,
        responsableFinancier: user?.nom || 'RAF'
      });
      alert(status === 'valider' ? "Budget validé avec succès !" : "Demande rejetée.");
      setShowBudgetModal(false);
      fetchData();
    } catch {
      alert("Erreur lors du traitement budgétaire.");
    }
  };

  const handlePaiementSubmit = async () => {
    if (!paiementForm.montant || !paiementForm.datePaiement) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await api.post('/paiements', {
        ...paiementForm,
        idReception: selectedReception.idReception
      });
      alert("Paiement enregistré et marché clôturé !");
      setShowPaiementModal(false);
      fetchData();
    } catch {
      alert("Erreur lors de l'enregistrement du paiement.");
    }
  };

  const filteredDemandes = demandes.filter(d => 
    (d.statut === 'En attente' || d.statut === 'Valide' || d.statut === 'Rejete') && 
    (d.nomService?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     d.idDemande.toString().includes(searchTerm))
  );

  const handleOpenDetails = (demande) => {
    setSelectedDemande(demande);
    setBudgetForm({ ...budgetForm, motif: '' }); // Reset motif for new view
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500">Chargement de l&apos;interface financière...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Espace RAF — Gestion Financière
          </h1>
          <p className="text-gray-500">Bienvenue, {user?.nom}. Gérez les budgets et les paiements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/raf/budgets')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <CreditCard className="h-4 w-4" /> Historique Budgets
          </button>
          <button
            onClick={() => navigate('/demandeur/demandes')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4" /> Nouvelle demande
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">En attente</p>
            <p className="text-xl font-bold text-gray-900">{demandes.filter(d => d.statut === 'En attente').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase">Validées</p>
            <p className="text-xl font-bold text-emerald-700">{demandes.filter(d => d.statut === 'Valide').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase">Rejetées</p>
            <p className="text-xl font-bold text-red-700">{demandes.filter(d => d.statut === 'Rejete').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Paiements</p>
            <p className="text-xl font-bold text-gray-900">{paiements.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Réceptions</p>
            <p className="text-xl font-bold text-gray-900">{receptions.length}</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('demandes')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'demandes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Validation Budgétaire
        </button>
        <button 
          onClick={() => setActiveTab('paiements')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'paiements' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Paiements & Facturation
        </button>
      </div>

      {/* Contenu de l'onglet Demandes */}
      {activeTab === 'demandes' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Demandes en attente de budget</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase"># ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDemandes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Aucune demande trouvée.</td>
                  </tr>
                ) : (
                  filteredDemandes.map((d) => (
                    <tr key={d.idDemande} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">#{d.idDemande}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{d.nomService || 'RAF'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {d.articles.slice(0, 1).map((a, i) => (
                            <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                              <Package className="h-3 w-3" /> {a.nomArticle} (x{a.quantite})
                            </div>
                          ))}
                          {d.articles.length > 1 && <span className="text-[10px] text-primary font-bold">+{d.articles.length - 1} autres articles</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.dateDemande).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                            d.statut === 'Valide' ? 'bg-green-100 text-green-700' : 
                            d.statut === 'Rejete' ? 'bg-red-100 text-red-700' : 
                            d.statut === 'En attente' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {d.statut}
                          </span>
                          {d.motif && (
                            <p className="text-[10px] text-gray-400 italic max-w-[120px] leading-tight">
                              {d.motif}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetails(d)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                        >
                          DÉTAILS
                        </button>
                        {d.statut === 'En attente' && (
                          <button 
                            onClick={() => openBudgetModal(d)}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-sm"
                          >
                            GÉRER
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenu de l'onglet Paiements */}
      {activeTab === 'paiements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Réceptions à payer</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase"># Rec</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Titulaire</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Montant Contrat</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date Réception</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {receptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Aucune réception en attente de paiement.</td>
                    </tr>
                  ) : (
                    receptions.map((r) => (
                      <tr key={r.idReception} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">#{r.idReception}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{r.titulaireMarche}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">{r.montant?.toLocaleString()} FBU</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.dateReception).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setSelectedReception(r); setPaiementForm({...paiementForm, montant: r.montant}); setShowPaiementModal(true); }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                          >
                            Payer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="font-bold text-gray-800">Historique des paiements</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">ID Paiement</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Titulaire</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paiements.map((p) => (
                    <tr key={p.idPaiement} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono">#{p.idPaiement}</td>
                      <td className="px-6 py-4 text-sm">{p.titulaireMarche}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{p.montant?.toLocaleString()} FBU</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Budget */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Validation Budgétaire</h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 uppercase font-bold">Demande sélectionnée</p>
                <p className="text-sm font-bold text-gray-800">#{selectedDemande.idDemande} — {selectedDemande.nomService}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Exercice Budgétaire</label>
                <input 
                  type="number" 
                  value={budgetForm.exerciceBudgetaire}
                  onChange={(e) => setBudgetForm({...budgetForm, exerciceBudgetaire: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Détails des Articles & Prix</label>
                <div className="space-y-3">
                  {tempArticles.map((art) => (
                    <div key={art.idLigne} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">{art.nomArticle}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">Qté: {art.quantite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">P.U</span>
                          <input 
                            type="number"
                            value={art.prixUnitaire}
                            onChange={(e) => updateArticlePrice(art.idLigne, e.target.value)}
                            className="w-full pl-10 pr-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="0"
                          />
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Total</p>
                          <p className="text-xs font-bold text-primary">{(art.prixUnitaire * art.quantite).toLocaleString()} FBU</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 font-mono">Montant Global Estimé (Auto)</label>
                <input 
                  type="number" 
                  readOnly
                  value={budgetForm.montantEstime}
                  className="w-full px-4 py-3 border rounded-xl outline-none bg-gray-100 font-bold text-lg text-primary"
                />
              </div>

              <div>
                <label className="flex text-xs font-bold text-gray-400 uppercase mb-1 justify-between">
                  Motif ou Note <span className="text-red-500 font-bold">* Obligatoire</span>
                </label>
                <textarea 
                  rows="2"
                  required
                  value={budgetForm.motif}
                  onChange={(e) => setBudgetForm({...budgetForm, motif: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                  placeholder={selectedDemande?.statut === 'Rejete' ? "Pourquoi rejeter..." : "Note pour le demandeur..."}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => handleBudgetSubmit('valider')}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <Check className="h-5 w-5" /> Valider
                </button>
                <button 
                  onClick={() => handleBudgetSubmit('rejeter')}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="h-5 w-5" /> Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaiementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Enregistrer un Paiement</h3>
              <button onClick={() => setShowPaiementModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 uppercase font-bold">Prestataire</p>
                <p className="text-sm font-bold text-gray-800">{selectedReception.titulaireMarche}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Montant à Payer (FBU)</label>
                <input 
                  type="number" 
                  value={paiementForm.montant}
                  onChange={(e) => setPaiementForm({...paiementForm, montant: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date de Paiement</label>
                <input 
                  type="date" 
                  value={paiementForm.datePaiement}
                  onChange={(e) => setPaiementForm({...paiementForm, datePaiement: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button 
                onClick={handlePaiementSubmit}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition mt-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                <CreditCard className="h-5 w-5" /> Confirmer le Paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Demande */}
      {showDetailsModal && selectedDemande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Détails de la Demande #{selectedDemande.idDemande}</h3>
                <div className="flex flex-col mt-1">
                  <p className="text-sm font-medium text-gray-700">Service : <span className="font-bold text-primary">{selectedDemande.nomService || 'RAF'}</span></p>
                  <p className="text-xs text-gray-500 italic">Chef responsable : {selectedDemande.nomChef || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">N° Budget</p>
                    <p className="text-sm font-bold text-primary">{selectedDemande.numeroBudget || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Source</p>
                    <p className="text-sm font-semibold">{selectedDemande.sourceFinancier || '—'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Type de marché</p>
                    <p className="text-sm font-semibold capitalize">{selectedDemande.typeMarche}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date soumission</p>
                    <p className="text-sm font-semibold">{new Date(selectedDemande.dateDemande).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {selectedDemande.motif && (
                  <div className={`p-4 rounded-2xl border ${selectedDemande.statut === 'Rejete' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1 opacity-60">Note / Motif du RAF</p>
                    <p className="text-sm font-medium italic">&ldquo;{selectedDemande.motif}&rdquo;</p>
                  </div>
                )}

                <h4 className="font-bold text-gray-800 text-sm mt-4">Articles demandés</h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Article</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Qté</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">P.U (FBU)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedDemande.articles.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.nomArticle}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{a.quantite}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{Number(a.prixUnitaire || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary text-right">
                            {( (a.prixUnitaire || 0) * a.quantite ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Total Estimé :</td>
                        <td className="px-4 py-2 text-right text-sm text-primary">
                          {selectedDemande.articles.reduce((acc, a) => acc + ( (a.prixUnitaire || 0) * a.quantite ), 0).toLocaleString()} FBU
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedDemande.statut === 'En attente' && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <label className="flex text-xs font-bold text-red-600 uppercase mb-2 justify-between">
                    Motif de décision <span className="font-bold">* Obligatoire pour Rejeter</span>
                  </label>
                  <textarea 
                    rows="2"
                    value={budgetForm.motif}
                    onChange={(e) => setBudgetForm({...budgetForm, motif: e.target.value})}
                    className="w-full px-4 py-2 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-sm"
                    placeholder="Pourquoi rejetez-vous ou quelle est votre note..."
                  ></textarea>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-auto">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition order-3 sm:order-1"
              >
                Fermer
              </button>
              {selectedDemande.statut === 'En attente' && (
                <>
                  <button 
                    onClick={async () => {
                      if (!budgetForm.motif || budgetForm.motif.trim() === '') {
                        alert("Veuillez saisir un motif pour rejeter la demande.");
                        return;
                      }
                      if(window.confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
                        try {
                          await api.post('/budgets/rejeter', {
                            idDemande: selectedDemande.idDemande,
                            exerciceBudgetaire: new Date().getFullYear(),
                            montantEstime: 0,
                            motif: budgetForm.motif,
                            responsableFinancier: user?.nom || 'RAF'
                          });
                          alert("Demande rejetée.");
                          setShowDetailsModal(false);
                          fetchData();
                        } catch {
                          alert("Erreur lors du rejet.");
                        }
                      }
                    }}
                    className="flex-1 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition order-2"
                  >
                    REJETER LA DEMANDE
                  </button>
                  <button 
                    onClick={() => { setShowDetailsModal(false); setShowBudgetModal(true); }}
                    className="flex-[1.5] py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 order-1 sm:order-3"
                  >
                    VALIDER LA DEMANDE <CheckCircle className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RafDashboard;

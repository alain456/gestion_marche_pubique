import { useState, useEffect, useMemo, Fragment } from 'react';
import api from '../../services/api';
import { 
  FileText, 
  PlusCircle, 
  Search,
  CheckCircle, 
  XCircle, 
  Clock, 
  Info,
  DollarSign,
  Gavel,
  Calendar,
  User,
  MessageSquare,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  History,
  BarChart3,
  Printer,
  Users
} from 'lucide-react';

const CgmpMarches = () => {
  const [marches, setMarches] = useState([]);
  const [groupedDemands, setGroupedDemands] = useState([]); // Nouveau nom pour plus de clarté
  const [allDemands, setAllDemands] = useState([]); // Pour retrouver les articles des marchés existants
  const [expandedBudgets, setExpandedBudgets] = useState({}); // Pour déplier/replier les containers
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [editingDemand, setEditingDemand] = useState(null);
  const [editingArticles, setEditingArticles] = useState([]);
  const [adjustmentMotif, setAdjustmentMotif] = useState('');
  
  const [form, setForm] = useState({
    idDemande: '',
    numeroBudget: '',
    montantEstime: '',
    modePassation: '',
    justificationChoix: '',
    seuilReglementaireApplique: '',
    dateSelection: new Date().toISOString().split('T')[0],
    validateur: '',
    statut: 'en attente',
    dateCloture: '',
    cloturePar: '',
    commentaire: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showDetails, setShowDetails] = useState(false);
  const [selectedMarche, setSelectedMarche] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    statut: '',
    dateCloture: '',
    cloturePar: '',
    commentaire: ''
  });

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'articles', 'soumissions', 'tracking'
  const [marcheArticles, setMarcheArticles] = useState([]);
  const [marcheOffers, setMarcheOffers] = useState([]);
  const [expandedMarches, setExpandedMarches] = useState({});
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMarche, setComparisonMarche] = useState(null);

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const fetchData = async () => {
    try {
      const [marchesRes, demandsRes] = await Promise.all([
        api.get('/marches'),
        api.get('/demandes')
      ]);
      setMarches(marchesRes.data);
      setAllDemands(demandsRes.data);
      const pending = demandsRes.data.filter(d => d.statut === 'Valide');
      
      // Groupement par Budget (Container)
      const grouped = pending.reduce((acc, d) => {
        const bid = d.idBudget;
        if (!acc[bid]) {
          acc[bid] = {
            idBudget: bid,
            numeroBudget: d.numeroBudget,
            typeMarche: d.typeMarche,
            exerciceBudgetaire: d.exerciceBudgetaire,
            totalMontant: 0,
            demands: []
          };
        }
        acc[bid].demands.push(d);
        acc[bid].totalMontant += Number(d.montantEstime || 0);
        return acc;
      }, {});

      setGroupedDemands(Object.values(grouped));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  // Logique de filtrage des containers (Demandes validées)
  const filteredGroupedDemands = useMemo(() => {
    return groupedDemands.filter(group => {
      const matchSearch = group.numeroBudget?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          group.typeMarche?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === '' || group.typeMarche === filterType;
      const matchYear = filterYear === '' || group.exerciceBudgetaire?.toString() === filterYear;
      
      return matchSearch && matchType && matchYear;
    });
  }, [groupedDemands, searchQuery, filterType, filterYear]);

  // Logique de filtrage des marchés existants
  const filteredMarches = useMemo(() => {
    return marches.filter(m => {
      const matchSearch = m.idMarche?.toString().includes(searchQuery) ||
                          m.numeroBudget?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.typeMarche?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === '' || m.typeMarche === filterType;
      const matchStatus = filterStatus === '' || m.statut === filterStatus;
      const matchYear = filterYear === '' || m.exerciceBudgetaire?.toString() === filterYear;

      return matchSearch && matchType && matchStatus && matchYear;
    });
  }, [marches, searchQuery, filterType, filterStatus, filterYear]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHistory = async (idDemande) => {
    setHistoryLoading(true);
    setHistoryData([]);
    setShowHistory(true);
    try {
      const res = await api.get(`/demandes/${idDemande}/history`);
      setHistoryData(res.data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      'Brouillon': 'bg-gray-100 text-gray-600 border border-gray-300',
      'Soumis': 'bg-blue-100 text-blue-800',
      'En attente': 'bg-amber-100 text-amber-800',
      'Valide': 'bg-green-100 text-green-800',
      'Rejete': 'bg-red-100 text-red-800',
      'Inclus dans Marché': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    };
    return styles[statut] || 'bg-gray-100 text-gray-800';
  };

  const toggleBudget = (idBudget) => {
    setExpandedBudgets(prev => ({ ...prev, [idBudget]: !prev[idBudget] }));
  };

  const handleCreateMarketForGroup = (group) => {
    setSelectedDemand(group.demands[0]); // Pour l'affichage dans le header
    const allIds = group.demands.map(d => d.idDemande).join(',');
    setForm(prev => ({ 
      ...prev, 
      idDemande: allIds,
      numeroBudget: group.numeroBudget || '',
      montantEstime: group.totalMontant || '' 
    }));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditArticles = (demand) => {
    setEditingDemand(demand);
    setEditingArticles(demand.articles.map(a => ({ ...a })));
    setAdjustmentMotif('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateArticleField = (index, field, value) => {
    const newArticles = [...editingArticles];
    newArticles[index][field] = value;
    setEditingArticles(newArticles);
  };

  const handleRejectDemand = async (demand) => {
    const motif = window.prompt("Motif du rejet (obligatoire pour le demandeur et le RAF) :");
    if (!motif || motif.trim() === "") {
      alert("Le motif est obligatoire pour rejeter une demande.");
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir rejeter la demande #${demand.idDemande} ?`)) {
      try {
        await api.put(`/demandes/${demand.idDemande}/statut`, { 
          statut: 'Rejete',
          motif: `[REJET CGMP] ${motif}`
        });
        setMessage('Demande rejetée. Le service demandeur et le RAF pourront consulter le motif.');
        fetchData();
      } catch (err) {
        console.error(err);
        setError('Erreur lors du rejet de la demande.');
      }
    }
  };

  const handleSaveArticles = async () => {
    try {
      await api.put(`/demandes/${editingDemand.idDemande}/cgmp-update`, { 
        articles: editingArticles,
        motif: adjustmentMotif 
      });
      setMessage('Les articles ont été modifiés. Le service demandeur en sera informé.');
      setEditingDemand(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour des articles.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/marches', form);
      setMessage('Marché créé et publié avec succès.');
      setShowForm(false);
        setForm({
          idDemande: '',
          numeroBudget: '',
          montantEstime: '',
          modePassation: '',
          justificationChoix: '',
          seuilReglementaireApplique: '',
          dateSelection: new Date().toISOString().split('T')[0],
          validateur: '',
          statut: 'en attente',
          dateCloture: '',
          cloturePar: '',
          commentaire: ''
        });
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création du marché.');
    }
  };

  const handleManage = async (marche) => {
    setSelectedMarche(marche);
    setActiveTab('info');
    setUpdateForm({
      idDemande: marche.idDemande,
      numeroBudget: marche.numeroBudget || '',
      montantEstime: marche.montantEstime,
      modePassation: marche.modePassation,
      justificationChoix: marche.justificationChoix,
      dateSelection: marche.dateSelection ? new Date(marche.dateSelection).toISOString().split('T')[0] : '',
      validateur: marche.validateur,
      statut: marche.statut,
      dateCloture: marche.dateCloture ? new Date(marche.dateCloture).toISOString().split('T')[0] : '',
      cloturePar: marche.cloturePar || '',
      commentaire: marche.commentaire || ''
    });

      // Récupérer les articles
      const articles = getConsolidatedArticles(marche.idDemande);
      setMarcheArticles(articles);

      // Récupérer les offres (soumissions) pour ce marché
      try {
        const offersRes = await api.get(`/soumissions/marche/${marche.idMarche}`);
        setMarcheOffers(offersRes.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des offres:", err);
        setMarcheOffers([]);
      }

    setShowDetails(true);
  };

  const handleShowComparison = (marche) => {
    setComparisonMarche(marche);
    setShowComparison(true);
  };


  const toggleMarcheExpansion = (idMarche) => {
    setExpandedMarches(prev => ({
      ...prev,
      [idMarche]: !prev[idMarche]
    }));
  };

  const getConsolidatedArticles = (idDemandeStr) => {
    if (!idDemandeStr) return [];
    const ids = idDemandeStr.toString().split(',').map(id => parseInt(id.trim()));
    const articles = [];
    allDemands.forEach(d => {
      if (ids.includes(d.idDemande)) {
        if (d.articles) {
          d.articles.forEach(art => {
            articles.push({
              ...art,
              serviceSource: d.nomService || d.roleDemandeur
            });
          });
        }
      }
    });
    return articles;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.put(`/marches/${selectedMarche.idMarche}`, updateForm);
      setMessage('Marché mis à jour avec succès.');
      setShowDetails(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du marché.');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Chargement des marchés...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gavel className="text-primary h-8 w-8" />
            Gestion des Marchés Publics
          </h1>
          <p className="text-gray-500 mt-2">Créez et suivez les appels d&apos;offres pour les demandes validées.</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}
      {/* Section des Filtres et Recherche */}
      <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Barre de recherche */}
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Recherche intelligente</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Rechercher un marché, un budget ou un ID..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres Dropdowns */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Type</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-xs font-bold text-gray-700 min-w-[150px] appearance-none"
              >
                <option value="">Tous les types</option>
                <option value="Travaux">Travaux</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Statut</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-xs font-bold text-gray-700 min-w-[150px] appearance-none"
              >
                <option value="">Tous les statuts</option>
                <option value="preparation">Préparation</option>
                <option value="publie">Publié</option>
                <option value="attribution">Attribué</option>
                <option value="cloture">Clôturé</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Année</label>
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-xs font-bold text-gray-700 min-w-[100px] appearance-none"
              >
                <option value="">Toutes</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {(searchQuery || filterType || filterStatus || filterYear) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('');
                  setFilterStatus('');
                  setFilterYear('');
                }}
                className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-xs uppercase"
                title="Réinitialiser"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire de création de marché */}
      {showForm && (
        <section className="bg-surface rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-6 bg-primary text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Nouveau marché</h2>
              <p className="text-blue-100 text-sm mt-1">
                Demande #{selectedDemand?.idDemande} — {selectedDemand?.nomService || selectedDemand?.roleDemandeur || 'Direction Générale'} 
                {selectedDemand?.nomDemandeur && ` (${selectedDemand.nomDemandeur})`}
              </p>
              <div className="mt-2 text-[10px] text-blue-100 uppercase font-bold">
                ID(s) Demande: {form.idDemande}
              </div>

            </div>
            <button onClick={() => setShowForm(false)} className="hover:bg-surface/10 p-2 rounded-full transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Reference du marché</label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  readOnly
                  value={form.numeroBudget}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-2xl outline-none transition-all font-bold text-primary cursor-not-allowed"
                  placeholder="Référence budget"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant Estimé (FBU)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  value={form.montantEstime}
                  onChange={(e) => setForm({...form, montantEstime: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mode de Passation</label>
              <div className="relative">
                <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  required
                  value={form.modePassation}
                  onChange={(e) => setForm({...form, modePassation: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner...</option>
                  <option value="AO">Appel d&apos;Offres</option>
                  <option value="AOR">Appel d&apos;Offres Restreint</option>
                  <option value="PVN">Procédure avec Négociation</option>
                  <option value="GG">Gré à Gré </option>
                  <option value="DC">Dialogue competitif</option>
                  <option value="PA">Procedure adapte</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Seuil Règlementaire Appliqué</label>
              <div className="relative">
                <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  required
                  value={form.seuilReglementaireApplique}
                  onChange={(e) => setForm({...form, seuilReglementaireApplique: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner un seuil...</option>
                  <optgroup label="Administrations Centrales / Entr. Publiques">
                    <option value="Travaux - Admin (> 10M BIF)">Travaux (≥ 10 000 000 BIF)</option>
                    <option value="Fournitures/Services - Admin (> 5M BIF)">Fournitures/Services (≥ 5 000 000 BIF)</option>
                  </optgroup>
                  <optgroup label="Communes (Collectivités)">
                    <option value="Travaux - Communes (> 12M BIF)">Travaux (≥ 12 000 000 BIF)</option>
                    <option value="Fournitures/Services - Communes (> 10M BIF)">Fournitures/Services (≥ 10 000 000 BIF)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de creation</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={form.dateSelection}
                  onChange={(e) => setForm({...form, dateSelection: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Clôture</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={form.dateCloture}
                  onChange={(e) => setForm({...form, dateCloture: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Responsable de Publication</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom du validateur"
                  value={form.validateur}
                  onChange={(e) => setForm({...form, validateur: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div> */}

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">État du Marché</label>
              <div className="relative">
                <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.statut}
                  onChange={(e) => setForm({...form, statut: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner un statut...</option>
                  {/* <option value="en attente">En attente</option> */}
                  <option value="preparation">Phase de préparation</option>
                  <option value="publie">Marche publié</option>
                  <option value="attribution">Attribue</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="cloture">Clôturé</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Responsable de Clôture</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom de la personne"
                  value={form.cloturePar}
                  onChange={(e) => setForm({...form, cloturePar: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Justification du choix du mode de passation</label>
              <textarea
                rows="2"
                value={form.justificationChoix}
                onChange={(e) => setForm({...form, justificationChoix: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="Expliquez pourquoi ce mode de passation a été retenu..."
              ></textarea>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Notes Additionnelles</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                <textarea
                  rows="2"
                  value={form.commentaire}
                  onChange={(e) => setForm({...form, commentaire: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="Informations complémentaires..."
                ></textarea>
              </div>
            </div>


            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4">
               <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
               >
                 Annuler
               </button>
               <button 
                type="submit"
                className="px-10 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
               >
                 <PlusCircle className="h-5 w-5" />
                 Publier le Marché
               </button>
            </div>
          </form>
        </section>
      )}

      {/* Modal de gestion du marché */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestion du Marché1 #{selectedMarche?.idMarche}.......</h2>
                <p className="text-gray-400 text-sm">
                  Demande #{selectedMarche?.idDemande} — {selectedMarche?.nomService || selectedMarche?.roleDemandeur || 'Direction Générale'}
                  {selectedMarche?.nomDemandeur && ` (${selectedMarche.nomDemandeur})`}
                </p>
              </div>
              <button onClick={() => setShowDetails(false)} className="hover:bg-surface/10 p-2 rounded-full transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {/* Onglets */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'info' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📋 Informations
              </button>
              <button 
                onClick={() => setActiveTab('articles')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'articles' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📦 Articles ({marcheArticles.length})
              </button>
              <button 
                onClick={() => setActiveTab('soumissions')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'soumissions' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                🤝 Soumissions ({marcheOffers.length})
              </button>
              <button 
                onClick={() => setActiveTab('tracking')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'tracking' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                📈 Suivi & Clôture
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Reference du marché</label>
                    <div className="relative">
                      <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        readOnly
                        value={updateForm.numeroBudget || ''}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-2xl outline-none transition-all font-bold text-primary cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant Estimé (FBU)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={updateForm.montantEstime || ''}
                        onChange={(e) => setUpdateForm({...updateForm, montantEstime: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mode de Passation</label>
                    <div className="relative">
                      <Gavel className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={updateForm.modePassation || ''}
                        onChange={(e) => setUpdateForm({...updateForm, modePassation: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                      >
                        <option value="AO">Appel d&apos;Offres</option>
                        <option value="AOR">Appel d&apos;Offres Restreint</option>
                        <option value="PVN">Procédure avec Négociation</option>
                        <option value="GG">Gré à Gré</option>
                        <option value="DC">Dialogue competitif</option>
                        <option value="PA">Procedure adapte</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de création</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={updateForm.dateSelection || ''}
                        onChange={(e) => setUpdateForm({...updateForm, dateSelection: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Validateur / Responsable</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={updateForm.validateur || ''}
                        onChange={(e) => setUpdateForm({...updateForm, validateur: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Justification du choix</label>
                    <textarea
                      rows="2"
                      value={updateForm.justificationChoix || ''}
                      onChange={(e) => setUpdateForm({...updateForm, justificationChoix: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    ></textarea>
                  </div>
                </div>
              )}

              {activeTab === 'articles' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-100/50">
                         <tr>
                           <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Article</th>
                           <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase">Quantité</th>
                           <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Prix Unit.</th>
                           <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Total</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {marcheArticles.length === 0 ? (
                           <tr>
                             <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-xs italic">Aucun article trouvé.</td>
                           </tr>
                         ) : (
                           marcheArticles.map((art, idx) => (
                             <tr key={idx} className="hover:bg-white transition-colors">
                               <td className="px-4 py-3">
                                 <p className="text-xs font-bold text-gray-700">{art.nomArticle}</p>
                                 <p className="text-[9px] text-gray-400 italic">{art.serviceSource}</p>
                                 {art.description && (
                                   <p className="text-[10px] text-blue-600 mt-1 leading-tight bg-blue-50/50 p-1 rounded border border-blue-100/30">
                                     <span className="font-bold">Spécif. :</span> {art.description}
                                   </p>
                                 )}
                               </td>
                               <td className="px-4 py-3 text-center text-xs font-bold text-gray-600">{art.quantite}</td>
                               <td className="px-4 py-3 text-right text-xs text-gray-600 font-mono">{Number(art.prixUnitaire).toLocaleString()}</td>
                               <td className="px-4 py-3 text-right text-xs font-black text-primary font-mono">{Number(art.quantite * art.prixUnitaire).toLocaleString()}</td>
                             </tr>
                           ))
                         )}
                       </tbody>
                       {marcheArticles.length > 0 && (
                         <tfoot className="bg-primary/5">
                           <tr>
                             <td colSpan="3" className="px-4 py-3 text-right text-[10px] font-black uppercase text-primary">Total Consolidé</td>
                             <td className="px-4 py-3 text-right text-sm font-black text-primary">
                               {marcheArticles.reduce((sum, a) => sum + (a.quantite * a.prixUnitaire), 0).toLocaleString()} FBU
                             </td>
                           </tr>
                         </tfoot>
                       )}
                     </table>
                   </div>
                </div>
              )}

              {activeTab === 'soumissions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Liste des prestataires ayant déposé une offre pour ce marché. Les offres sont classées par montant croissant (Mieux-disant).
                    </p>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Offres Reçues ({marcheOffers.length})
                    </h3>
                    {marcheOffers.length >= 2 && (
                      <button 
                        onClick={() => handleShowComparison(selectedMarche)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Comparer les Offres
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Soumissionnaire</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Dépôt</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant Proposé</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {marcheOffers.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic text-sm">Aucune offre déposée pour le moment.</td>
                          </tr>
                        ) : (
                          marcheOffers.map((offer, idx) => (
                            <tr key={offer.idOffre} className={`hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-emerald-50/30' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {idx === 0 && (
                                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm" title="Meilleure offre">
                                      <CheckCircle className="h-3 w-3" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{offer.nomSoumissionnaire}</p>
                                    <p className="text-[10px] text-gray-500">{offer.email || offer.telephone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                {new Date(offer.dateSoumission).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`text-sm font-black ${idx === 0 ? 'text-emerald-600' : 'text-primary'}`}>
                                  {Number(offer.montantPropose).toLocaleString()} FBU
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-bold uppercase">
                                  Reçu
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'tracking' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Timeline Visuelle */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Étape actuelle du processus</p>
                    <div className="relative flex justify-between">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ 
                          width: updateForm.statut === 'en attente' ? '0%' : 
                                 updateForm.statut === 'publie' ? '33.33%' : 
                                 updateForm.statut === 'attribution' ? '66.66%' : 
                                 updateForm.statut === 'suspendu' ? '66.66%' : '100%' 
                        }}
                      ></div>
                      
                      {[
                        { id: 'en attente', label: 'Préparation', icon: Clock },
                        { id: 'publie', label: 'Publication', icon: FileText },
                        { id: 'attribution', label: 'Attribution', icon: Gavel },
                        { id: 'cloture', label: 'Clôture', icon: CheckCircle }
                      ].map((step) => {
                        const statusOrder = ['en attente', 'publie', 'attribution', 'cloture'];
                        const currentIdx = statusOrder.indexOf(updateForm.statut === 'suspendu' ? 'attribution' : updateForm.statut);
                        const stepIdx = statusOrder.indexOf(step.id);
                        
                        const isCompleted = currentIdx > stepIdx;
                        const isActive = currentIdx === stepIdx;
                        
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                              isActive ? 'bg-primary text-white scale-125' : 
                              isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              <step.icon className="h-4 w-4" />
                            </div>
                            <span className={`mt-2 text-[9px] font-bold uppercase tracking-tighter ${
                              isActive ? 'text-primary' : 
                              isCompleted ? 'text-emerald-600' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Statut du Marché</label>
                      <div className="relative">
                        <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={updateForm.statut}
                          onChange={(e) => setUpdateForm({...updateForm, statut: e.target.value})}
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none font-bold ${
                            updateForm.statut === 'cloture' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            updateForm.statut === 'publie' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            updateForm.statut === 'attribution' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            updateForm.statut === 'en attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-gray-50 text-primary border-gray-100'
                          }`}
                        >
                          <option value="en attente">Phase de Préparation (Modifiable)</option>
                          <option value="publie">Marché Publié</option>
                          <option value="attribution">Marché Attribué</option>
                          <option value="suspendu">Marché Suspendu</option>
                          <option value="cloture">Marché Clôturé</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Clôture</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={updateForm.dateCloture}
                          onChange={(e) => setUpdateForm({...updateForm, dateCloture: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Clôturé Par</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Nom du responsable de clôture"
                          value={updateForm.cloturePar}
                          onChange={(e) => setUpdateForm({...updateForm, cloturePar: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Commentaires / Rapport Final</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                        <textarea
                          rows="3"
                          value={updateForm.commentaire}
                          onChange={(e) => setUpdateForm({...updateForm, commentaire: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                          placeholder="Informations sur la fin du marché..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-50 sticky bottom-0 bg-surface pb-2">
                <button 
                  type="button" 
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des demandes validées groupées par Budget (Containers) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutGrid className="text-primary h-6 w-6" />
          Demandes Validées par Container Budgétaire
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroupedDemands.length === 0 ? (
            <div className="col-span-full p-12 bg-surface rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
               {searchQuery || filterType || filterYear ? "Aucun résultat pour ces filtres." : "Aucune demande validée en attente de traitement."}
            </div>
          ) : (
            filteredGroupedDemands.map(group => (
              <div key={group.idBudget} className={`bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group ${expandedBudgets[group.idBudget] ? 'lg:col-span-3 md:col-span-2 col-span-1' : ''}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        {group.demands.length} Demande{group.demands.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {group.numeroBudget || 'Budget Inconnu'}
                  </h3>
                  
                  <div className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase mb-4 ${
                    group.typeMarche === 'fourniture' ? 'bg-blue-100 text-blue-800' :
                    group.typeMarche === 'travaux' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {group.typeMarche}
                  </div>

                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Montant Total Estimé</p>
                    <p className="text-xl font-black text-primary">{Number(group.totalMontant).toLocaleString()} FBU</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-4">
                    <span>Exercice {group.exerciceBudgetaire || '2026'}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCreateMarketForGroup(group)}
                        className="flex items-center gap-1 text-emerald-600 font-bold hover:underline text-[10px]"
                      >
                        <PlusCircle className="h-4 w-4" /> GÉRER LE MARCHÉ
                      </button>
                      <button 
                        onClick={() => toggleBudget(group.idBudget)}
                        className="flex items-center gap-1 text-primary font-bold hover:underline"
                      >
                        {expandedBudgets[group.idBudget] ? 'Cacher' : 'Voir'}
                        {expandedBudgets[group.idBudget] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails des demandes acceptées */}
                {expandedBudgets[group.idBudget] && (
                  <div className="bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {group.demands.map(d => (
                        <div key={d.idDemande} className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                          <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID Demande:</span>
                                <span className="ml-1 text-sm font-mono font-bold">#{d.idDemande}</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => fetchHistory(d.idDemande)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                                  title="Historique"
                                >
                                  <History className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleStartEditArticles(d)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                  title="Modifier les quantités ou prix"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleRejectDemand(d)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                  title="Rejeter pour correction"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-gray-400 uppercase font-bold text-[9px] mb-1">Montant Estimé</p>
                                <p className="font-bold text-primary text-sm">{Number(d.montantEstime || 0).toLocaleString()} FBU</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-gray-400 uppercase font-bold text-[9px] mb-1">Responsable Financier</p>
                                <p className="font-semibold text-gray-700 text-sm">{d.responsableFinancier || 'RAF'}</p>
                              </div>
                            </div>

                            {/* Liste des articles avec descriptions */}
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 flex items-center gap-2">
                                <LayoutGrid className="h-3 w-3" /> Articles & Spécifications
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {d.articles && d.articles.map((art, idx) => (
                                  <div key={idx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-gray-700">{art.nomArticle} (x{art.quantite})</span>
                                      <span className="text-[10px] font-bold text-primary">{Number(art.prixUnitaire * art.quantite).toLocaleString()} FBU</span>
                                    </div>
                                    {art.description && (
                                      <p className="text-[10px] text-gray-500 italic leading-tight mb-1">
                                        Spec: {art.description}
                                      </p>
                                    )}
                                    {art.montant > 0 && (
                                      <p className="text-[9px] text-amber-600 font-bold bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100/50 w-fit">
                                        Proposé: {Number(art.montant).toLocaleString()} FBU
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                 d.renvoyee === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                               }`}>
                                 {d.renvoyee === 1 ? 'RENVOYÉE' : 'VALIDE'}
                               </span>
                             </div>
                             <div className="text-[10px] text-gray-400 font-medium">
                               Validé le {d.dateValidation ? new Date(d.dateValidation).toLocaleDateString() : new Date(d.dateDemande).toLocaleDateString()}
                             </div>
                          </div>

                          {d.motif && (
                            <div className="p-3 bg-blue-50 border-t border-blue-100 text-[10px] text-blue-700 italic flex gap-2">
                              <MessageSquare className="h-4 w-4 shrink-0 text-blue-400" />
                              <p><span className="font-bold not-italic">Note RAF :</span> {d.motif}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Liste des marchés existants */}
      <section className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            Marchés Publics Enregistrés
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-surface">
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID / Demande</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reference du marché</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Passation</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Montant Estimé</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Clôture</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMarches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-12 text-center text-gray-400">
                    {searchQuery || filterType || filterStatus || filterYear ? "Aucun marché trouvé pour ces filtres." : "Aucun marché enregistré."}
                  </td>
                </tr>
              ) : (
                filteredMarches.map(m => {
                  const consolidated = getConsolidatedArticles(m.idDemande);
                  const isExpanded = expandedMarches[m.idMarche];
                  
                  return (
                    <Fragment key={m.idMarche}>
                      <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-primary/5' : ''}`}>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleMarcheExpansion(m.idMarche)}
                              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                                isExpanded ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <div>
                              <div className="text-sm font-bold text-gray-900">Marché #{m.idMarche}</div>
                              <div className="text-[10px] text-gray-500 font-medium">Demande #{m.idDemande}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="text-sm font-bold text-primary">{m.numeroBudget || 'N/A'}</span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{m.modePassation}</td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{Number(m.montantEstime).toLocaleString()} FBU</td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                          {m.dateCloture ? new Date(m.dateCloture).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex flex-col gap-2 min-w-[150px]">
                            <div className="flex justify-between items-center px-1">
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${m.statut === 'en attente' ? 'text-primary' : 'text-gray-400'}`}>P</span>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${m.statut === 'publie' ? 'text-blue-600' : 'text-gray-400'}`}>A</span>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${m.statut === 'attribution' ? 'text-emerald-600' : 'text-gray-400'}`}>G</span>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${m.statut === 'cloture' ? 'text-gray-600' : 'text-gray-400'}`}>C</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full relative overflow-hidden">
                              <div 
                                className={`absolute top-0 left-0 h-full transition-all duration-700 rounded-full ${
                                  m.statut === 'suspendu' ? 'bg-amber-500' : 
                                  m.statut === 'cloture' ? 'bg-gray-400' : 'bg-primary'
                                }`}
                                style={{ 
                                  width: m.statut === 'en attente' ? '15%' : 
                                         m.statut === 'publie' ? '40%' : 
                                         m.statut === 'attribution' ? '70%' : 
                                         m.statut === 'suspendu' ? '50%' : '100%' 
                                }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              m.statut === 'cloture' ? 'text-gray-500' : 
                              m.statut === 'publie' ? 'text-blue-600' : 
                              m.statut === 'attribution' ? 'text-emerald-600' : 
                              m.statut === 'suspendu' ? 'text-amber-600' : 'text-primary'
                            }`}>
                              {m.statut}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right">
                          <button 
                            onClick={() => handleManage(m)}
                            className="text-primary hover:text-blue-800 font-bold text-xs flex items-center gap-1 justify-end ml-auto group"
                          >
                            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Gérer
                          </button>
                        </td>
                      </tr>
                      
                      {/* Ligne d'extension pour les articles */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan="7" className="px-8 py-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-inner overflow-hidden">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Articles Consolidés ({consolidated.length})</span>
                                <span className="text-[10px] font-bold text-primary">Total: {consolidated.reduce((sum, a) => sum + (a.quantite * a.prixUnitaire), 0).toLocaleString()} FBU</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                                {consolidated.length === 0 ? (
                                  <p className="col-span-full text-center text-[10px] text-gray-400 py-4 italic">Aucun détail d&apos;article disponible.</p>
                                ) : (
                                  consolidated.map((art, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                      <div>
                                        <p className="text-[11px] font-bold text-gray-700">{art.nomArticle}</p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-tighter">{art.serviceSource}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-black text-primary">x{art.quantite}</p>
                                        <p className="text-[9px] text-gray-400 font-mono">{Number(art.prixUnitaire).toLocaleString()} FBU</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Modal de modification des articles par la CGMP */}
      {editingDemand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary px-8 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Ajustement des Articles</h2>
                  <p className="text-xs text-white/70">Demande #{editingDemand.idDemande} - {editingDemand.nomService}</p>
                </div>
              </div>
              <button onClick={() => setEditingDemand(null)} className="p-2 hover:bg-surface/10 rounded-full transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex gap-3 items-start">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Note:</strong> Toute modification de la quantité ou du prix sera notifiée au service demandeur. Les montants totaux seront recalculés automatiquement.
                </p>
              </div>

              <div className="space-y-4">
                {editingArticles.map((art, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{art.nomArticle}</p>
                      {art.description && (
                        <p className="text-[10px] text-blue-600 italic leading-tight bg-blue-50/50 p-1.5 rounded border border-blue-100/30 mb-1">
                          {art.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Quantité</label>
                      <input 
                        type="number"
                        className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        value={art.quantite}
                        onChange={(e) => handleUpdateArticleField(idx, 'quantite', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Prix Unitaire (FBU)</label>
                      <input 
                        type="number"
                        className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        value={art.prixUnitaire}
                        onChange={(e) => handleUpdateArticleField(idx, 'prixUnitaire', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" /> Note d&apos;ajustement technique (Optionnel)
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all italic"
                  placeholder="Expliquez pourquoi ces modifications ont été apportées (ex: Standardisation, budget insuffisant...)"
                  value={adjustmentMotif}
                  onChange={(e) => setAdjustmentMotif(e.target.value)}
                ></textarea>
                <p className="text-[10px] text-gray-400">Cette note sera visible par le service demandeur sur son tableau de bord.</p>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
              <button 
                onClick={() => setEditingDemand(null)}
                className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveArticles}
                className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-800 transition-all flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Enregistrer les Modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historique */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl p-0 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface/10 rounded-xl">
                  <History className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">Historique Complet</h3>
                  <p className="text-blue-200 text-xs font-bold opacity-80 uppercase tracking-tighter">Audit Trail & Timeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-2 hover:bg-surface/10 rounded-full transition-colors"
              >
                <XCircle className="h-7 w-7" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-gray-500 font-bold animate-pulse uppercase text-xs tracking-widest">Récupération des données...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aucun historique disponible pour cette demande.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8">
                  {historyData.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Point sur la ligne */}
                      <div className={`absolute left-[-41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all duration-300 group-hover:scale-125 ${
                        item.action.includes('Validation') || item.nouveauStatut === 'Valide' ? 'bg-emerald-500 shadow-emerald-200' :
                        item.nouveauStatut === 'Inclus dans Marché' ? 'bg-indigo-500 shadow-indigo-200' :
                        item.action.includes('Rejet') || item.nouveauStatut === 'Rejete' ? 'bg-red-500 shadow-red-200' :
                        'bg-blue-500 shadow-blue-200'
                      }`} />
                      
                      <div className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.action}</h4>
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border border-gray-200">
                            {new Date(item.dateAction).toLocaleString('fr-FR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-700">{item.nomUtilisateur}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.roleUtilisateur}</p>
                          </div>
                        </div>

                        {item.nouveauStatut && (
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Nouveau Statut :</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatutBadge(item.nouveauStatut)}`}>
                              {item.nouveauStatut}
                            </span>
                          </div>
                        )}

                        {item.motif && (
                          <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl italic text-xs text-amber-800 relative">
                            <MessageSquare className="h-3 w-3 absolute -top-1.5 -left-1.5 bg-amber-100 rounded-full p-0.5 text-amber-600 border border-amber-200" />
                            &ldquo;{item.motif}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-surface border-t border-gray-100 text-right shrink-0">
              <button 
                onClick={() => setShowHistory(false)} 
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                Fermer l&apos;Historique
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Comparatif des Offres */}
      {showComparison && comparisonMarche && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-900 px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Analyse Comparative des Offres</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Marché #{comparisonMarche.idMarche} — Budget Estimé : {Number(comparisonMarche.montantEstime).toLocaleString()} FBU</p>
                </div>
              </div>
              <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rang</th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Soumissionnaire</th>
                      <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix Proposé</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Écart / Budget</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Délai de Livraison</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {marcheOffers
                      .sort((a, b) => a.montantPropose - b.montantPropose)
                      .map((offer, idx) => {
                        const budget = Number(comparisonMarche.montantEstime);
                        const price = Number(offer.montantPropose);
                        const diff = ((price - budget) / budget) * 100;
                        const isBest = idx === 0;

                        return (
                          <tr key={offer.idOffre} className={`hover:bg-gray-50/50 transition-colors ${isBest ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-4 py-6">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                                isBest ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {idx + 1}
                              </div>
                            </td>
                            <td className="px-4 py-6">
                              <p className="font-black text-gray-800 text-sm">{offer.nomSoumissionnaire}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{offer.email}</p>
                            </td>
                            <td className="px-4 py-6 text-right">
                              <p className={`font-black text-sm ${isBest ? 'text-blue-600' : 'text-gray-700'}`}>
                                {Number(offer.montantPropose).toLocaleString()} FBU
                              </p>
                            </td>
                            <td className="px-4 py-6 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                diff <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-6 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                {offer.delaiLivraison || 'Non précisé'}
                              </div>
                            </td>
                            <td className="px-4 py-6 text-center">
                              {isBest && (
                                <div className="flex items-center justify-center gap-1.5 text-blue-600 animate-bounce">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-[10px] font-black uppercase">Mieux-disant</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Info className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-900 text-sm uppercase">Note d&apos;Analyse CGMP</h4>
                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                      L&apos;offre de <strong>{marcheOffers[0]?.nomSoumissionnaire}</strong> est actuellement la plus avantageuse économiquement, 
                      se situant à <strong>{Math.abs(((Number(marcheOffers[0]?.montantPropose) - Number(comparisonMarche.montantEstime)) / Number(comparisonMarche.montantEstime)) * 100).toFixed(1)}%</strong> 
                      {Number(marcheOffers[0]?.montantPropose) <= Number(comparisonMarche.montantEstime) ? ' en dessous' : ' au-dessus'} de votre estimation budgétaire.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setShowComparison(false)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
              >
                Fermer l&apos;analyse
              </button>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Imprimer l&apos;Analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CgmpMarches;

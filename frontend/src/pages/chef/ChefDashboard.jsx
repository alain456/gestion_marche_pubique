import { useState, useEffect, useContext } from 'react';
import { 
  Gavel, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Info, 
  Eye, 
  Clock, 
  User, 
  Building,
  Briefcase,
  History,
  ClipboardCheck,
  Send,
  Calendar,
  Filter,
  Search,
  ListFilter,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChefDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const userRole = user?.role?.toUpperCase().replace(/\s+/g, '_') || '';
  const [marches, setMarches] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marches');
  const [selectedMarche, setSelectedMarche] = useState(null);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showOffresModal, setShowOffresModal] = useState(false);
  const [offres, setOffres] = useState([]);
  const [offresLoading, setOffresLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  const [filterService, setFilterService] = useState('tous');
  const [filterStatus, setFilterStatus] = useState('tous');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marchesRes, demandesRes, servicesRes] = await Promise.all([
        api.get('/marches'),
        api.get('/demandes'),
        api.get('/services')
      ]);
      setMarches(marchesRes.data);
      setDemandes(demandesRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Erreur chargement marchés:', err);
      setError('Impossible de charger les marchés.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchOffres = async (idMarche) => {
    setOffresLoading(true);
    try {
      const res = await api.get(`/marches/${idMarche}/soumissionnaires`);
      setOffres(res.data);
    } catch (err) {
      console.error('Erreur chargement offres:', err);
    } finally {
      setOffresLoading(false);
    }
  };

  const handleOpenOffres = (marche) => {
    setSelectedMarche(marche);
    fetchOffres(marche.idMarche);
    setShowOffresModal(true);
  };

  const handleShowHistory = async (demande) => {
    setSelectedDemande(demande);
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const res = await api.get(`/demandes/${demande.idDemande}/history`);
      setHistoryData(res.data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const markChefAlerteAsVue = async (idDemande) => {
    try {
      await api.put(`/demandes/${idDemande}/mark-chef-vue`);
      fetchData();
    } catch (err) {
      console.error('Erreur lors du marquage de la notification Chef:', err);
    }
  };

  const updateMarcheStatus = async (idMarche, newStatus, successMsg) => {
    if (!window.confirm(`Confirmer le passage au statut "${newStatus}" ?`)) return;
    try {
      await api.put(`/marches/${idMarche}/statut`, { statut: newStatus });
      setMessage(successMsg);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour.');
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      // Pour les marchés
      'en attente': 'bg-amber-100 text-amber-700 border-amber-200',
      'publie': 'bg-blue-100 text-blue-700 border-blue-200',
      'attribution': 'bg-purple-100 text-purple-700 border-purple-200',
      'notification': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'contrat_signe': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cloture': 'bg-gray-100 text-gray-700 border-gray-200',
      'suspendu': 'bg-red-100 text-red-700 border-red-200',
      // Pour les demandes
      'Brouillon': 'bg-gray-100 text-gray-500 border-gray-200',
      'Soumis': 'bg-blue-100 text-blue-600 border-blue-200',
      'En attente': 'bg-amber-100 text-amber-600 border-amber-200',
      'Validé par Chef de Service': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Rejeté par Chef de Service': 'bg-red-100 text-red-600 border-red-200',
      'Validé par RAF': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejeté par RAF': 'bg-red-100 text-red-700 border-red-200',
      'Accepté par CGMP': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Rejeté par CGMP': 'bg-rose-100 text-rose-700 border-rose-200',
      'Inclus dans Marché': 'bg-violet-100 text-violet-700 border-violet-200',
    };
    return styles[statut] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse font-medium">Chargement du dashboard stratégique...</p>
      </div>
    );
  }

  const counts = {
    total: marches.length,
    attendant: marches.filter(m => m.statut === 'en attente').length,
    publie: marches.filter(m => m.statut === 'publie').length,
    attribution: marches.filter(m => m.statut === 'attribution').length,
    cloture: marches.filter(m => m.statut === 'cloture').length,
  };

  const filteredDemandes = demandes.filter(d => {
    const matchService = filterService === 'tous' || d.idService === parseInt(filterService);
    let matchStatus = true;
    if (filterStatus === 'valide') {
      matchStatus = d.statut.includes('Validé') || d.statut.includes('Accepté');
    } else if (filterStatus === 'rejete') {
      matchStatus = d.statut.includes('Rejeté');
    }
    return matchService && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-2xl shadow-lg shadow-blue-100">
              <Building className="h-7 w-7" />
            </div>
            {userRole === 'CHEF_INSTITUTION' ? "Chef d'Institution" : "Chef de Service"}
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
            {userRole === 'CHEF_INSTITUTION' 
              ? "Supervision et validation des marchés publics de l'institution."
              : "Suivi et gestion des demandes d'achat de votre service."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/demandeur/demandes')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <PlusCircle className="h-5 w-5" /> Nouvelle Demande
          </button>
          <button onClick={fetchData} className="p-3 bg-surface border border-gray-100 rounded-2xl text-gray-500 hover:text-primary transition-all shadow-sm">
            <History className="h-5 w-5" />
          </button>
          <div className="px-5 py-3 bg-primary/5 text-primary rounded-2xl border border-primary/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
            <Calendar className="h-4 w-4" />
            Session: {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-8">
        <button 
          onClick={() => setActiveTab('marches')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'marches' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Suivi des Marchés
          {activeTab === 'marches' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-in slide-in-from-bottom-1" />}
        </button>
        <button 
          onClick={() => setActiveTab('demandes')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'demandes' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Flux des Demandes d&apos;Achat
          {activeTab === 'demandes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-in slide-in-from-bottom-1" />}
        </button>
      </div>

      {message && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl animate-in slide-in-from-top-2 font-bold flex items-center gap-2"><CheckCircle className="h-5 w-5" /> {message}</div>}
      {error && <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl animate-in slide-in-from-top-2 font-bold flex items-center gap-2"><XCircle className="h-5 w-5" /> {error}</div>}

      {activeTab === 'marches' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-gray-900">{counts.total}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marchés Totaux</p>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-amber-600">{counts.attendant}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Attente</p>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Send className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-indigo-600">{counts.publie}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Publiés / En Cours</p>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-emerald-600">{counts.attribution}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attributions</p>
            </div>
          </div>

          {/* Main Content Table */}
          <div className="bg-surface rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Portefeuille des Marchés Publics</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Info className="h-4 w-4" />
                Mise à jour en temps réel
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marché & Objet</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Détails Financiers</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode / Service</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions Stratégiques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {marches.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-400">
                        <Gavel className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold uppercase text-xs tracking-widest">Aucun marché actif à superviser.</p>
                      </td>
                    </tr>
                  ) : (
                    marches.map((m) => (
                      <tr key={m.idMarche} className="hover:bg-gray-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 mb-0.5 uppercase tracking-tight">MARCHÉ #{m.idMarche}</p>
                              <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">ID Demande: {m.idDemande}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-primary">{Number(m.montantEstime).toLocaleString()} FBU</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Budget Estimé</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-black uppercase w-fit tracking-tighter">
                              <Gavel className="h-3 w-3" /> {m.modePassation}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold w-fit italic">
                              <Building className="h-3 w-3" /> {m.nomService || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatutBadge(m.statut)}`}>
                            {m.statut}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenOffres(m)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              title="Visualiser les Offres"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            
                            {m.statut === 'attribution' && (
                              <button 
                                onClick={() => updateMarcheStatus(m.idMarche, 'notification', 'Notification d\'attribution envoyée.')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                              >
                                <Send className="h-4 w-4" /> Notifier
                              </button>
                            )}

                            {m.statut === 'notification' && (
                              <button 
                                onClick={() => updateMarcheStatus(m.idMarche, 'contrat_signe', 'Contrat signé par le Chef Institution.')}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" /> Signer Contrat
                              </button>
                            )}

                            {m.statut === 'en attente' && (
                              <button 
                                onClick={() => updateMarcheStatus(m.idMarche, 'publie', 'Marché publié avec succès.')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                              >
                                Autoriser Publication
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Section Demandes */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          {/* Bar de Filtrage */}
          <div className="bg-surface p-4 rounded-4xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Triage Stratégique :</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm min-w-[200px]"
                >
                  <option value="tous">Tous les Services</option>
                  {services.map(s => (
                    <option key={s.idService} value={s.idService}>{s.nomService}</option>
                  ))}
                </select>
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ListFilter className="h-3 w-3 text-gray-300" />
                </div>
              </div>

              <div className="relative">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm min-w-[180px]"
                >
                  <option value="tous">Tous les Statuts</option>
                  <option value="valide">Demandes Validées</option>
                  <option value="rejete">Demandes Rejetées</option>
                </select>
                <ClipboardCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ListFilter className="h-3 w-3 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                {filteredDemandes.length} Résultat(s)
              </span>
              {(filterService !== 'tous' || filterStatus !== 'tous') && (
                <button 
                  onClick={() => { setFilterService('tous'); setFilterStatus('tous'); }}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic">Flux des Demandes Institutionnelles</h2>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">
                TEMPS RÉEL ACTIF
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Origine & Date</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenu & Articles</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut Actuel</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Traçabilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDemandes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-gray-400">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold uppercase text-xs tracking-widest">Aucune demande ne correspond à ces critères.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDemandes.map((d) => (
                      <tr key={d.idDemande} className="hover:bg-gray-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 mb-0.5 uppercase tracking-tighter">{d.nomService || 'Service Inconnu'}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(d.dateDemande).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-600">
                              {d.articles?.length || 0} Article(s)
                            </span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[250px] font-medium">
                              {d.articles?.map(a => a.nomArticle).join(', ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatutBadge(d.statut)}`}>
                                {d.statut}
                              </span>
                              {d.modifieParCgmp === 1 && d.alerteChef === 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); markChefAlerteAsVue(d.idDemande); }}
                                  className="px-2 py-1 bg-rose-500 text-white text-[9px] font-black uppercase rounded-lg animate-pulse hover:scale-105 transition-transform"
                                  title="Cliquer pour marquer comme lu"
                                >
                                  Modifié par CGMP
                                </button>
                              )}
                              {d.modifieParCgmp === 1 && d.alerteChef === 1 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded-lg">
                                  Modifié par CGMP (Lu)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleShowHistory(d)}
                            className="px-4 py-2 bg-surface border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 ml-auto shadow-sm"
                          >
                            <History className="h-4 w-4" /> Voir Historique
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualisation des Offres */}
      {showOffresModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className="bg-surface rounded-4xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-linear-to-br from-gray-900 to-gray-800 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Offres des Soumissionnaires</h3>
                <p className="text-blue-300 text-sm font-medium mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Marché #{selectedMarche?.idMarche} | {selectedMarche?.modePassation}
                </p>
              </div>
              <button 
                onClick={() => setShowOffresModal(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1">
              {offresLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Analyse des propositions...</p>
                </div>
              ) : offres.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold uppercase text-xs tracking-widest">Aucune offre enregistrée pour ce marché.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offres.map((o) => (
                    <div key={o.idOffre} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-primary/20 transition-all">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black">
                            {o.nomSoumissionnaire.charAt(0)}
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                            o.statut === 'retenu' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            o.statut === 'rejeté' ? 'bg-red-50 text-red-600 border-red-100' : 
                            'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                            {o.statut}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">{o.nomSoumissionnaire}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <User className="h-3 w-3" /> {o.email || 'Pas d\'email'}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant Proposé</p>
                          <p className="text-xl font-black text-primary">{Number(o.montantPropose).toLocaleString()} FBU</p>
                        </div>
                        {o.statut === 'retenu' && (
                          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 text-right bg-surface">
              <button 
                onClick={() => setShowOffresModal(false)}
                className="px-10 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Historique de la Demande */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-4xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest italic">Historique d&apos;Audit en Temps Réel</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Suivi de la demande</p>
                  <p className="text-lg font-black text-gray-900">#{selectedDemande?.idDemande} - {selectedDemande?.nomService}</p>
                </div>
              </div>

              {historyLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Récupération des logs d&apos;activité...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-20 text-gray-400 italic">
                  Aucun événement enregistré pour cette demande.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {historyData.map((event, idx) => (
                    <div key={idx} className="relative pl-12">
                      <div className={`absolute left-0 top-1 h-9 w-9 rounded-full border-4 border-gray-50 flex items-center justify-center z-10 ${
                        event.nouveauStatut?.includes('Rejeté') ? 'bg-red-500 text-white' : 
                        event.nouveauStatut?.includes('Validé') ? 'bg-emerald-500 text-white' : 
                        'bg-primary text-white'
                      }`}>
                        {idx === 0 ? <Send className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">{event.action}</h4>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                            {new Date(event.dateAction).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${getStatutBadge(event.nouveauStatut)}`}>
                            {event.nouveauStatut || 'N/A'}
                          </span>
                          <span className="text-gray-300 text-xs">|</span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {event.nomUtilisateur?.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">{event.nomUtilisateur} ({event.roleUtilisateur})</span>
                          </div>
                        </div>
                        {event.motif && (
                          <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl text-xs text-amber-900 italic flex gap-2">
                            <Info className="h-4 w-4 shrink-0 text-amber-500" />
                            <span>&ldquo;{event.motif}&rdquo;</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;

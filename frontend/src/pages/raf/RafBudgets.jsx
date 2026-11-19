import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  CreditCard,
  Building,
  Package,
  ChevronRight,
  CheckCircle,
  Clock,
  Layers,
  CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getServiceOrRoleLabel } from '../../utils/formatters';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import SavedFilters from '../../components/SavedFilters';
import ReportExport from '../../components/ReportExport';
import ConfirmDialog from '../../components/ConfirmDialog';

const RafBudgets = () => {
  const { hasPermission, user } = useContext(AuthContext);
  const canValidate = hasPermission('VALIDER_BUDGET_DEMANDE');
  
  const [budgets, setBudgets] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [groupedDemandes, setGroupedDemandes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDemandes, setGroupDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterService, setFilterService] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showGroupedView, setShowGroupedView] = useState(true);
  const [selectedForValidation, setSelectedForValidation] = useState([]);
  const [motif, setMotif] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [feedback, setFeedback] = useState('');

  const fetchData = async () => {
    try {
      const [budRes, demRes, groupedRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/demandes'),
        api.get('/budgets/demandes-grouped')
      ]);
      setBudgets(budRes.data);
      setDemandes(demRes.data);
      setGroupedDemandes(groupedRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDemandes = async (typeMarche) => {
    try {
      const res = await api.get(`/budgets/demandes-by-type/${typeMarche}`);
      setGroupDemandes(res.data);
      setSelectedGroup(typeMarche);
    } catch (err) {
      console.error('Erreur lors du chargement des demandes du groupe:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const filteredBudgets = budgets.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const relatedDemandes = demandes.filter(d => d.idBudget === b.idBudget);
    const matchesSearch = !searchTerm ||
      b.numeroBudget?.toLowerCase().includes(searchLower) ||
      relatedDemandes.some(d =>
        String(d.idDemande).includes(searchLower) ||
        d.nomDemandeur?.toLowerCase().includes(searchLower) ||
        getServiceOrRoleLabel(d).toLowerCase().includes(searchLower) ||
        d.roleDemandeur?.toLowerCase().includes(searchLower) ||
        d.motif?.toLowerCase().includes(searchLower) ||
        String(d.idMarche || '').includes(searchLower) ||
        d.marchesAssocies?.includes(searchLower) ||
        d.articles?.some(article => article.nomArticle?.toLowerCase().includes(searchLower))
      );
    const matchesType = filterType === 'Tous' || b.typeBudget === filterType;
    
    // Filtrer par service (si au moins une demande du service est liée à ce budget)
    const matchesService = !filterService || demandes.some(d => 
      d.idBudget === b.idBudget && getServiceOrRoleLabel(d) === filterService
    );
    
    return matchesSearch && matchesType && matchesService;
  });

  const filteredTypeGroups = groupedDemandes.map(group => {
    const matchingDemands = demandes.filter(d => {
      if (d.statut !== 'En attente' || d.typeMarche !== group.typeMarche) return false;
      const label = getServiceOrRoleLabel(d);
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        label.toLowerCase().includes(searchLower) ||
        d.nomDemandeur?.toLowerCase().includes(searchLower) ||
        d.roleDemandeur?.toLowerCase().includes(searchLower) ||
        d.numeroBudget?.toLowerCase().includes(searchLower) ||
        d.motif?.toLowerCase().includes(searchLower) ||
        d.marchesAssocies?.includes(searchLower) ||
        String(d.idDemande).includes(searchLower) ||
        d.articles?.some(article => article.nomArticle?.toLowerCase().includes(searchLower));
      const matchesService = !filterService || label === filterService;
      const matchesPriority = !filterPriority || d.priorite === filterPriority;
      return matchesSearch && matchesService && matchesPriority;
    });

    return { ...group, matchingCount: matchingDemands.length };
  }).filter(group =>
    (filterType === 'Tous' || group.typeMarche === filterType) &&
    group.matchingCount > 0
  );

  const filteredGroupDemandes = groupDemandes.filter(d => {
    const label = getServiceOrRoleLabel(d);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      label.toLowerCase().includes(searchLower) ||
      d.roleDemandeur?.toLowerCase().includes(searchLower) ||
      d.nomDemandeur?.toLowerCase().includes(searchLower) ||
      d.motif?.toLowerCase().includes(searchLower) ||
      d.numeroBudget?.toLowerCase().includes(searchLower) ||
      String(d.idMarche || '').includes(searchLower) ||
      d.marchesAssocies?.includes(searchLower) ||
      d.articles?.some(article => article.nomArticle?.toLowerCase().includes(searchLower)) ||
      d.idDemande.toString().includes(searchTerm);
    const matchesService = !filterService || label === filterService;
    const matchesPriority = !filterPriority || d.priorite === filterPriority;
    
    return matchesSearch && matchesService && matchesPriority;
  });

  const services = [...new Set(demandes.map(d => getServiceOrRoleLabel(d)))].filter(Boolean).sort();

  // Calculer les stats pour chaque budget
  const getBudgetStats = (idBudget) => {
    const relatedDemandes = demandes.filter(d => d.idBudget === idBudget);
    const validDemandes = relatedDemandes.filter(d => d.statut === 'Valide');
    
    const consumedAmount = validDemandes.reduce((total, d) => {
      const demandeAmount = d.articles?.reduce((sum, a) => sum + (a.montant || a.quantite * a.prixUnitaire || 0), 0) || 0;
      return total + demandeAmount;
    }, 0);

    return {
      count: relatedDemandes.length,
      valid: validDemandes.length,
      pending: relatedDemandes.filter(d => d.statut === 'En attente').length,
      consumed: consumedAmount
    };
  };

  const handleSelectForValidation = (idDemande) => {
    setSelectedForValidation(prev => 
      prev.includes(idDemande) 
        ? prev.filter(id => id !== idDemande)
        : [...prev, idDemande]
    );
  };

  const handleSelectAll = () => {
    if (selectedForValidation.length === groupDemandes.length) {
      setSelectedForValidation([]);
    } else {
      setSelectedForValidation(groupDemandes.map(d => d.idDemande));
    }
  };

  const handleBulkValidate = async () => {
    if (selectedForValidation.length === 0) {
      setFeedback('Veuillez sélectionner au moins une demande.');
      return;
    }
    setBulkResults([]);
    setFeedback('');
    setConfirmation(true);
  };

  const confirmBulkValidate = async () => {
    try {
      const response = await api.post('/budgets/bulk-valider', {
        idDemandes: selectedForValidation,
        motif: motif || 'Validation groupée par type de marché'
      });
      const results = response.data.results;
      if (!Array.isArray(results)) {
        throw new Error('Le serveur n’a pas retourné le détail des validations.');
      }
      setBulkResults(results);
      const succeededIds = new Set(results.filter(result => result.success).map(result => Number(result.idDemande)));
      setFeedback(`${succeededIds.size} demande(s) validée(s), ${results.length - succeededIds.size} échec(s).`);
      setSelectedForValidation(prev => prev.filter(id => !succeededIds.has(Number(id))));
      setMotif('');
      await fetchData();
      if (selectedGroup) {
        await fetchGroupDemandes(selectedGroup);
      }
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      setFeedback(err.response?.data?.message || err.message || 'Erreur lors de la validation.');
    } finally {
      setConfirmation(false);
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setGroupDemandes([]);
    setSelectedForValidation([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      {feedback && (
        <p role="status" aria-live="polite" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {feedback}
        </p>
      )}
      {bulkResults.length > 0 && (
        <section aria-label="Résultat des validations groupées" className="rounded-xl border border-gray-200 bg-surface p-4">
          <h2 className="font-semibold text-gray-800">Résultat par demande</h2>
          <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm">
            {bulkResults.map(result => (
              <li key={result.idDemande} className={`flex flex-col gap-1 rounded-lg px-3 py-2 sm:flex-row sm:justify-between ${result.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                <span>Demande #{result.idDemande} — {result.success ? 'Réussite' : 'Échec'}</span>
                <span>{result.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" /> 
            {selectedGroup ? `Validation - Type: ${selectedGroup}` : 'Suivi des Enveloppes Budgétaires'}
          </h1>
          <p className="text-gray-500 mt-1">
            {selectedGroup 
              ? 'Validez les demandes groupées par type de marché.' 
              : 'Consultez les demandes regroupées par conteneur budgétaire.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedGroup ? (
            <button 
              onClick={handleBackToGroups}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Retour aux groupes
            </button>
          ) : (
            <Link 
              to="/raf" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          )}
          {!selectedGroup && (
            <button 
              onClick={() => setShowGroupedView(!showGroupedView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium shadow-sm ${
                showGroupedView 
                  ? 'bg-primary text-white hover:bg-blue-800 shadow-blue-100' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers className="h-4 w-4" /> {showGroupedView ? 'Vue Standard' : 'Vue Groupée'}
            </button>
          )}
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Enveloppes</p>
              <p className="text-xl font-black text-gray-900">{budgets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Demandes Liées</p>
              <p className="text-xl font-black text-gray-900">{demandes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">En Attente</p>
              <p className="text-xl font-black text-gray-900">{groupedDemandes.reduce((sum, g) => sum + g.count, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {!selectedGroup && (
        <ReportExport
          rows={filteredBudgets}
          title="Budgets"
          fileName="rapport-budgets"
          yearField="exerciceBudgetaire"
          criteria={[
            searchTerm && `Recherche : ${searchTerm}`,
            filterType !== 'Tous' && `Type : ${filterType}`,
            filterService && `Service : ${filterService}`
          ].filter(Boolean).join(' · ')}
          columns={[
            { key: 'idBudget', label: 'N° budget', value: row => row.numeroBudget || `#${row.idBudget}` },
            { key: 'exerciceBudgetaire', label: 'Exercice' },
            { key: 'typeBudget', label: 'Type' },
            { key: 'montantEstime', label: 'Montant alloué (FBU)' },
            { key: 'sourceFinancier', label: 'Source de financement' },
            { key: 'statusValidation', label: 'Statut' },
            { key: 'typeInstitution', label: 'Institution' }
          ]}
        />
      )}
      {!selectedGroup && (
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recherche globale</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher par budget, numéro de demande, demandeur, service ou marché..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full font-medium"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type de Marché</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 min-w-[140px]"
                >
                  <option value="Tous">Tous les types</option>
                  <option value="fourniture">Fourniture</option>
                  <option value="travaux">Travaux</option>
                  <option value="service">Service</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Demandeur</label>
                <select 
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 min-w-[180px]"
                >
                  <option value="">Tous les services</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {selectedGroup && (
                <div className="space-y-2 animate-in slide-in-from-right-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priorité</label>
                  <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-700 min-w-[120px]"
                  >
                    <option value="">Toutes</option>
                    <option value="Normale">Normale</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              )}
              {(searchTerm || filterType !== 'Tous' || filterService || filterPriority) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('Tous');
                    setFilterService('');
                    setFilterPriority('');
                  }}
                  className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-xs uppercase mt-6"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
          <SavedFilters
            storageKey={`saved-filters:raf-budgets:${user?.idUser || 'guest'}`}
            filters={{ searchTerm, filterType, filterService }}
            onApply={(saved) => {
              setSearchTerm(saved.searchTerm || '');
              setFilterType(saved.filterType || 'Tous');
              setFilterService(saved.filterService || '');
            }}
          />
          </div>
        </div>
      )}

      {/* Vue groupée par typeMarche */}
      {showGroupedView && !selectedGroup && (
        <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Validation Groupée par Type de Marché
            </h2>
            <p className="text-sm text-gray-500 mt-1">Validez les demandes regroupées par type de marché</p>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-10 text-center">Chargement...</div>
            ) : filteredTypeGroups.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Aucune demande ne correspond à ces filtres.</div>
            ) : (
              filteredTypeGroups.map((group) => (
                <div key={group.typeMarche} className="p-6 hover:bg-gray-50/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        group.typeMarche === 'fourniture' ? 'bg-blue-50 text-blue-600' :
                        group.typeMarche === 'travaux' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize">{group.typeMarche}</h3>
                        <p className="text-sm text-gray-500">{group.matchingCount} demande(s) correspondant aux filtres</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{group.totalMontant?.toLocaleString() || 0} Fbu</p>
                        <p className="text-xs text-gray-400">Montant total</p>
                      </div>
                      {canValidate && (
                        <button 
                          onClick={() => fetchGroupDemandes(group.typeMarche)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition font-medium shadow-sm shadow-blue-100"
                        >
                          <CheckSquare className="h-4 w-4" /> Valider
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Vue détaillée d'un groupe */}
      {selectedGroup && (
        <div className="space-y-4">
          {/* Barre d'actions */}
          <div className="bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
              {canValidate && (
                <input
                  type="checkbox"
                  checked={selectedForValidation.length === groupDemandes.length && groupDemandes.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {selectedForValidation.length} / {groupDemandes.length} sélectionnées
              </span>
            </div>
            {canValidate && (
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
                <input
                  type="text"
                  placeholder="Motif de validation..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="min-h-11 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:w-64"
                />
                <button
                  onClick={handleBulkValidate}
                  disabled={selectedForValidation.length === 0}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4" /> Valider ({selectedForValidation.length})
                </button>
              </div>
            )}
          </div>

          {/* Table des demandes du groupe */}
          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-12"></th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Demandeur</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Articles</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGroupDemandes.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">Aucune demande trouvée pour ces filtres.</td></tr>
                  ) : (
                    filteredGroupDemandes.map((demande) => (
                      <tr key={demande.idDemande} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          {canValidate && (
                            <input
                              type="checkbox"
                              checked={selectedForValidation.includes(demande.idDemande)}
                              onChange={() => handleSelectForValidation(demande.idDemande)}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{(demande.roleDemandeur?.toLowerCase() === 'receptioniste' || demande.roleDemandeur?.toLowerCase() === 'receptionniste') ? 'Réceptionniste' : (demande.nomService || demande.roleDemandeur || 'Direction Générale')}</span>
                            <span className={`text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded-full w-fit ${
                              demande.priorite === 'Critique' ? 'bg-red-100 text-red-700' :
                              demande.priorite === 'Urgente' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {demande.priorite || 'Normale'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{demande.nomDemandeur}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                            {demande.articles?.length || 0} article(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {demande.articles?.reduce((sum, a) => sum + (a.montant || a.quantite * a.prixUnitaire || 0), 0).toLocaleString() || 0} Fbu
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

      {/* Table standard des conteneurs */}
      {!showGroupedView && !selectedGroup && (
        <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Numéro Budget</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exercice</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Demandes</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Montant Estimé</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center">Chargement...</td></tr>
                ) : filteredBudgets.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Aucun budget trouvé.</td></tr>
                ) : (
                  filteredBudgets.map((budget) => {
                    const stats = getBudgetStats(budget.idBudget);
                    const isMontantValide = budget.montantEstime && budget.montantEstime > 0;
                    const ratio = isMontantValide ? (stats.consumed / budget.montantEstime) : 0;
                    const pourcentage = isMontantValide ? (ratio * 100).toFixed(0) : 0;
                    
                    const progressColor = ratio > 0.9 ? 'bg-red-500 text-red-500' : ratio > 0.7 ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500';

                    return (
                      <tr key={budget.idBudget} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900">{budget.numeroBudget || 'Non spécifié'}</span>
                            <span className="text-[10px] text-gray-400">ID: #{budget.idBudget}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            budget.typeBudget === 'fourniture' ? 'bg-blue-100 text-blue-700' :
                            budget.typeBudget === 'travaux' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {budget.typeBudget || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {budget.exerciceBudgetaire || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-gray-700">{stats.count} Total</span>
                            <div className="flex items-center gap-2 text-[10px] font-medium">
                              <span className="text-emerald-600 flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div> {stats.valid} Valide</span>
                              <span className="text-amber-600 flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div> {stats.pending} En attente</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 min-w-[150px]">
                            <div className="flex justify-between items-end">
                              <span className="text-xs font-black text-primary">
                                {isMontantValide ? budget.montantEstime.toLocaleString() + ' Fbu' : 'Non défini'}
                              </span>
                              <span className={`text-[10px] font-black uppercase ${progressColor.split(' ')[1]}`}>
                                {pourcentage}%
                              </span>
                            </div>
                            {/* Barre de progression */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${progressColor.split(' ')[0]}`}
                                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold italic">
                              Consommé: {stats.consumed.toLocaleString()} Fbu
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {confirmation && (
        <ConfirmDialog
          title="Confirmer la validation groupée"
          message={`${selectedForValidation.length} demande(s) vont être validées. Vérifiez la sélection avant de confirmer.`}
          confirmLabel="Valider les demandes"
          onConfirm={confirmBulkValidate}
          onCancel={() => setConfirmation(false)}
        >
          <ul className="mt-4 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            {selectedForValidation.map(id => {
              const demande = groupDemandes.find(item => Number(item.idDemande) === Number(id));
              return <li key={id}>#{id} — {demande?.nomDemandeur || getServiceOrRoleLabel(demande || {})}</li>;
            })}
          </ul>
        </ConfirmDialog>
      )}
    </div>
  );
};

export default RafBudgets;

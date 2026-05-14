import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Download,
  Calendar,
  CreditCard,
  User,
  Building,
  Package,
  ChevronRight,
  CheckCircle,
  Clock,
  Layers,
  CheckSquare,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const RafBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [groupedDemandes, setGroupedDemandes] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDemandes, setGroupDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [showGroupedView, setShowGroupedView] = useState(true);
  const [selectedForValidation, setSelectedForValidation] = useState([]);
  const [motif, setMotif] = useState('');

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
    const matchesSearch = !searchTerm || 
      b.numeroBudget.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tous' || b.typeBudget === filterType;
    return matchesSearch && matchesType;
  });

  // Calculer les stats pour chaque budget
  const getBudgetStats = (idBudget) => {
    const relatedDemandes = demandes.filter(d => d.idBudget === idBudget);
    const totalValid = relatedDemandes.filter(d => d.statut === 'Valide').length;
    return {
      count: relatedDemandes.length,
      valid: totalValid,
      pending: relatedDemandes.filter(d => d.statut === 'En attente').length
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
      alert('Veuillez sélectionner au moins une demande');
      return;
    }
    try {
      await api.post('/budgets/bulk-valider', {
        idDemandes: selectedForValidation,
        motif: motif || 'Validation groupée par type de marché'
      });
      alert(`${selectedForValidation.length} demandes validées avec succès`);
      setSelectedForValidation([]);
      setMotif('');
      fetchData();
      if (selectedGroup) {
        fetchGroupDemandes(selectedGroup);
      }
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation');
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
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition font-medium shadow-sm shadow-blue-100">
            <Download className="h-4 w-4" /> Exporter Rapport
          </button>
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
        <div className="bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par n° de budget..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-surface min-w-[150px]"
            >
              <option value="Tous">Tous les types</option>
              <option value="fourniture">Fourniture</option>
              <option value="travaux">Travaux</option>
              <option value="service">Service</option>
            </select>
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
            ) : groupedDemandes.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Aucune demande en attente.</div>
            ) : (
              groupedDemandes.map((group) => (
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
                        <p className="text-sm text-gray-500">{group.count} demandes en attente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{group.totalMontant?.toLocaleString() || 0} Fbu</p>
                        <p className="text-xs text-gray-400">Montant total</p>
                      </div>
                      <button 
                        onClick={() => fetchGroupDemandes(group.typeMarche)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition font-medium shadow-sm shadow-blue-100"
                      >
                        <CheckSquare className="h-4 w-4" /> Valider
                      </button>
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
              <input
                type="checkbox"
                checked={selectedForValidation.length === groupDemandes.length && groupDemandes.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedForValidation.length} / {groupDemandes.length} sélectionnées
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Motif de validation..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
              <button
                onClick={handleBulkValidate}
                disabled={selectedForValidation.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4" /> Valider ({selectedForValidation.length})
              </button>
            </div>
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
                  {groupDemandes.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Aucune demande trouvée.</td></tr>
                  ) : (
                    groupDemandes.map((demande) => (
                      <tr key={demande.idDemande} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedForValidation.includes(demande.idDemande)}
                            onChange={() => handleSelectForValidation(demande.idDemande)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{demande.nomService}</span>
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
                    return (
                      <tr key={budget.idBudget} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900">{budget.numeroBudget}</span>
                            <span className="text-[10px] text-gray-400">ID: #{budget.idBudget}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            budget.typeBudget === 'fourniture' ? 'bg-blue-100 text-blue-700' :
                            budget.typeBudget === 'travaux' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {budget.typeBudget}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {budget.exerciceBudgetaire}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{stats.count}</span>
                            <div className="flex gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" title={`${stats.valid} validées`}></div>
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" title={`${stats.pending} en attente`}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {budget.montantEstime?.toLocaleString() || 0} Fbu
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
    </div>
  );
};

export default RafBudgets;

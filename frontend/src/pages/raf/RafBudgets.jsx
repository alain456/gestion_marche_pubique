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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const RafBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');

  const fetchData = async () => {
    try {
      const [budRes, demRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/demandes')
      ]);
      setBudgets(budRes.data);
      setDemandes(demRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" /> Suivi des Enveloppes Budgétaires
          </h1>
          <p className="text-gray-500 mt-1">Consultez les demandes regroupées par conteneur budgétaire.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/raf" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 transition font-medium shadow-sm shadow-blue-100">
            <Download className="h-4 w-4" /> Exporter Rapport
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Exercice Actuel</p>
              <p className="text-xl font-black text-gray-900">{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
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
            className="px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white min-w-[150px]"
          >
            <option value="Tous">Tous les types</option>
            <option value="fourniture">Fourniture</option>
            <option value="travaux">Travaux</option>
            <option value="service">Service</option>
          </select>
        </div>
      </div>

      {/* Table des conteneurs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
    </div>
  );
};

export default RafBudgets;

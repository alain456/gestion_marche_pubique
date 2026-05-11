import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  FileText, 
  TrendingUp,
  Clock,
  Search,
  Filter,
  Calendar,
  Building
} from 'lucide-react';

const ReceptionDashboard = () => {
  const [data, setData] = useState({
    marches: [],
    soumissions: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // all, 1, 2, 3, 7, 30
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [marchesRes, soumissionsRes] = await Promise.all([
        api.get('/marches'),
        api.get('/soumissions')
      ]);
      setData({
        marches: marchesRes.data,
        soumissions: soumissionsRes.data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  // Logique de filtrage et recherche
  const filteredSoumissions = useMemo(() => {
    let result = [...data.soumissions];

    // 1. Filtrage par période
    if (period !== 'all') {
      const now = new Date();
      const limitDate = new Date();
      
      if (period.endsWith('h')) {
        const hours = parseInt(period);
        limitDate.setHours(now.getHours() - hours);
      } else {
        const days = parseInt(period);
        limitDate.setDate(now.getDate() - days);
      }
      
      result = result.filter(s => new Date(s.dateSoumission) >= limitDate);
    }

    // 2. Recherche par marché, référence ou date
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const sDate = new Date(s.dateSoumission).toLocaleDateString();
        const marketRef = s.referenceAppelOffre ? s.referenceAppelOffre.toLowerCase() : '';
        const marketId = s.idMarche.toString();
        const bidderName = s.nomSoumissionnaire ? s.nomSoumissionnaire.toLowerCase() : '';
        
        return marketId.includes(query) || 
               marketRef.includes(query) || 
               bidderName.includes(query) ||
               sDate.includes(query);
      });
    }

    return result;
  }, [data.soumissions, period, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const offersToday = data.soumissions.filter(s => {
      const sDate = new Date(s.dateSoumission).toISOString().split('T')[0];
      return sDate === today;
    }).length;

    return {
      activeMarkets: data.marches.filter(m => m.statut === 'publie').length,
      totalOffers: filteredSoumissions.length,
      totalOffersToday: offersToday
    };
  }, [data, filteredSoumissions]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-gray-500 animate-pulse">Chargement des statistiques...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord — Réception</h1>
          <p className="text-gray-500 mt-2">Suivi et analyse des soumissions reçues.</p>
        </div>
        
        {/* Filtres et Recherche */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Toutes les périodes</option>
              <option value="1">Dernières 24h</option>
              <option value="2">Derniers 2 jours</option>
              <option value="3">Derniers 3 jours</option>
              <option value="7">Dernière semaine</option>
              <option value="30">Dernier mois</option>
              <option value="1h">Dernière heure</option>
              <option value="2h">Dernières 2 heures</option>
              

            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Marché, réf ou date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <FileText size={80} className="text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nombres Total des offres </p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.totalOffers}</h3>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
              <TrendingUp size={14} />
              <span>{searchQuery ? 'Résultats filtrés' : 'Données réelles'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Clock size={80} className="text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Reçues Aujourd&apos;hui</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.totalOffersToday}</h3>
            <p className="text-xs text-gray-500 mt-4 font-medium">Global (indépendant des filtres)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Building size={80} className="text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Marchés Publiés</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.activeMarkets}</h3>
            <p className="text-xs text-gray-500 mt-4 font-medium italic">Prêts à recevoir des offres</p>
          </div>
        </div>
      </div>

      {/* Section Résultats (si recherche active) */}
      {searchQuery && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Résultats de recherche ({filteredSoumissions.length})
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSoumissions.map(s => (
                    <tr key={s.idOffre} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{s.nomSoumissionnaire}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">Marché #{s.idMarche}</div>
                        <div className="text-[10px] text-gray-400 uppercase">{s.referenceAppelOffre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(s.dateSoumission).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-primary">
                        {Number(s.montantPropose).toLocaleString()} FBU
                      </td>
                    </tr>
                  ))}
                  {filteredSoumissions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                        Aucun résultat correspondant à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionDashboard;

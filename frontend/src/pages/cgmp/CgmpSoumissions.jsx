import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Building, 
  Calendar,
  FileText,
  TrendingUp,
  Download
} from 'lucide-react';

const CgmpSoumissions = () => {
  const [data, setData] = useState({
    marches: [],
    soumissions: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState('all');

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
  }, []);

  const filteredSoumissions = useMemo(() => {
    let result = [...data.soumissions];

    // 1. Filtrage par période
    if (period !== 'all') {
      const now = new Date();
      const limitDate = new Date();
      if (period.endsWith('h')) {
        limitDate.setHours(now.getHours() - parseInt(period));
      } else {
        limitDate.setDate(now.getDate() - parseInt(period));
      }
      result = result.filter(s => new Date(s.dateSoumission) >= limitDate);
    }

    // 2. Filtrage par marché
    if (selectedMarketId !== 'all') {
      result = result.filter(s => s.idMarche.toString() === selectedMarketId);
    }

    // 3. Recherche textuelle intelligente
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const isNumeric = /^\d+$/.test(query);

      result = result.filter(s => {
        const bidderName = s.nomSoumissionnaire ? s.nomSoumissionnaire.toLowerCase() : '';
        const marketRef = s.referenceAppelOffre ? s.referenceAppelOffre.toLowerCase() : '';
        const marketId = s.idMarche.toString();

        if (isNumeric) {
          return marketId === query;
        }
        return bidderName.includes(query) || marketRef.includes(query);
      });
    }

    return result;
  }, [data.soumissions, period, searchQuery, selectedMarketId]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Chargement des soumissions...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header avec Titre et Filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            Liste des Soumissionnaires
          </h1>
          <p className="text-gray-500 mt-2">Consultation de toutes les offres déposées par marché.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filtre Marché */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tous les marchés</option>
              {data.marches.map(m => (
                <option key={m.idMarche} value={m.idMarche}>Marché #{m.idMarche}</option>
              ))}
            </select>
          </div>

          {/* Filtre Période */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Toutes périodes</option>
              <option value="1">Dernières 24h</option>
              <option value="7">Dernière semaine</option>
              <option value="30">Dernier mois</option>
            </select>
          </div>

          {/* Barre de Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher nom ou réf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64"
            />
          </div>

          {/* Bouton Reset */}
          {(searchQuery || selectedMarketId !== 'all' || period !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedMarketId('all');
                setPeriod('all');
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Résumé Statistique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Offres Affichées</p>
            <h3 className="text-2xl font-black text-gray-900">{filteredSoumissions.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Enregistré</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.length}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des Soumissionnaires */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date Dépôt</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSoumissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-gray-400 italic">
                    Aucun soumissionnaire trouvé avec ces critères.
                  </td>
                </tr>
              ) : (
                filteredSoumissions.map(s => (
                  <tr key={s.idOffre} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-gray-700">#{s.idOffre}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{s.nomSoumissionnaire}</div>
                      <div className="text-xs text-gray-500">{s.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-gray-700">Marché #{s.idMarche}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{s.referenceAppelOffre}</div>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-gray-600">{s.telephone}</td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(s.dateSoumission).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="text-sm font-black text-primary">{Number(s.montantPropose).toLocaleString()} FBU</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CgmpSoumissions;

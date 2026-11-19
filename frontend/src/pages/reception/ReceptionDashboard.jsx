import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import api from '../../services/api';
import EcheanceAlerts from '../../components/EcheanceAlerts';
import DossierAttachments from '../../components/DossierAttachments';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  FileText, 
  TrendingUp,
  Search,
  Filter,
  Building
} from 'lucide-react';

const ReceptionDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    marches: [],
    soumissions: [],
    receptions: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState('all');

  const canViewReceptions = user?.permissions?.includes('VOIR_RECEPTIONS');
  const canUploadReceptionDocuments = user?.permissions?.some(permission =>
    ['VALIDER_RECEPTION', 'ENREGISTRER_EXECUTION'].includes(permission)
  );

  const fetchData = useCallback(async () => {
    try {
      const requests = [api.get('/marches'), api.get('/soumissions')];
      const receptionIndex = canViewReceptions ? requests.push(api.get('/receptions')) - 1 : -1;
      const responses = await Promise.all(requests);
      setData({
        marches: responses[0].data,
        soumissions: responses[1].data,
        receptions: receptionIndex === -1 ? [] : responses[receptionIndex].data
      });
    } catch (err) {
      console.error('Erreur lors du chargement du tableau de réception:', err);
    } finally {
      setLoading(false);
    }
  }, [canViewReceptions]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredSoumissions = useMemo(() => {
    let result = [...data.soumissions];

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

    if (selectedMarketId !== 'all') {
      result = result.filter(s => s.idMarche.toString() === selectedMarketId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const isNumeric = /^\d+$/.test(query);

      result = result.filter(s => {
        const marketRef = s.referenceAppelOffre ? s.referenceAppelOffre.toLowerCase() : '';
        const bidderName = s.nomSoumissionnaire ? s.nomSoumissionnaire.toLowerCase() : '';
        const marketId = s.idMarche.toString();
        
        if (isNumeric) {
          // Si c'est un chiffre, on veut une correspondance exacte avec l'ID du marché
          return marketId === query;
        }
        
        // Sinon recherche classique dans le texte
        return marketRef.includes(query) || bidderName.includes(query);
      });
    }

    return result;
  }, [data.soumissions, period, searchQuery, selectedMarketId]);

  const groupedSoumissions = useMemo(() => {
    return filteredSoumissions.reduce((acc, offer) => {
      const marketKey = offer.idMarche;
      if (!acc[marketKey]) {
        acc[marketKey] = {
          marketInfo: { idMarche: offer.idMarche, reference: offer.referenceAppelOffre },
          offers: []
        };
      }
      acc[marketKey].offers.push(offer);
      return acc;
    }, {});
  }, [filteredSoumissions]);

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
      <p className="text-gray-500">Chargement...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Réception</h1>
          <p className="text-gray-500 mt-2">Suivi et analyse des soumissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tous les marchés</option>
              {data.marches.map(m => (
                <option key={m.idMarche} value={m.idMarche}>Marché #{m.idMarche}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Toutes les périodes</option>
              <option value="1">Dernières 24h</option>
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
              placeholder="Nom ou référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <EcheanceAlerts />

      {canViewReceptions && data.receptions.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-slate-100 bg-surface p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Dossiers de réception</h2>
            <p className="text-sm text-slate-500">Procès-verbaux et versions des pièces du dossier.</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.receptions.map(reception => (
              <li key={reception.idReception} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">
                    Réception #{reception.idReception} · {reception.typeReception || 'Réception'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Contrat #{reception.idContrat} · {reception.dateReception ? new Date(reception.dateReception).toLocaleDateString('fr-FR') : 'Date non précisée'} · {reception.conformite || 'Conformité non précisée'}
                  </p>
                </div>
                <DossierAttachments
                  entityType="reception"
                  entityId={reception.idReception}
                  canUpload={canUploadReceptionDocuments}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Offres</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.totalOffers}</h3>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
              <TrendingUp size={14} />
              <span>{searchQuery || selectedMarketId !== 'all' ? 'Filtré' : 'Total'}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Reçues Aujourd&apos;hui</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.totalOffersToday}</h3>
            <p className="text-xs text-gray-500 mt-4 font-medium">Global</p>
          </div>
        </div>

        {/* <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Marchés Publiés</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.activeMarkets}</h3>
            <p className="text-xs text-gray-500 mt-4 font-medium italic">En cours</p>
          </div>
        </div> */}
      </div>

      <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {searchQuery || selectedMarketId !== 'all' || period !== 'all' 
            ? `Résultats de recherche (${filteredSoumissions.length})` 
            : `Toutes les offres (${filteredSoumissions.length})`}
        </h2>
        <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.keys(groupedSoumissions).length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">
                      Aucune offre trouvée.
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedSoumissions).map(group => (
                    <React.Fragment key={group.marketInfo.idMarche}>
                      {/* Market Header Row */}
                      <tr className="bg-primary/5 border-y border-primary/10">
                        <td colSpan="3" className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="font-bold text-primary">Marché #{group.marketInfo.idMarche}</span>
                            {group.marketInfo.reference && (
                              <span className="text-xs text-primary/70 font-semibold px-2 py-0.5 bg-primary/10 rounded-md">
                                {group.marketInfo.reference}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 ml-auto font-medium">
                              {group.offers.length} offre{group.offers.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {/* Offers Rows */}
                      {group.offers.map(s => (
                        <tr key={s.idOffre} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap pl-10">
                            <div className="font-bold text-gray-900">{s.nomSoumissionnaire}</div>
                            <div className="text-xs text-gray-500">{s.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                            {s.telephone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(s.dateSoumission).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;

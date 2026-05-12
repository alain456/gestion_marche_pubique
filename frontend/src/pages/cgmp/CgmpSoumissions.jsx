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
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [showMotifModal, setShowMotifModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [motif, setMotif] = useState('');

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

  const handleStatusUpdate = async (idOffre, newStatus, rejectionMotif = null) => {
    try {
      const offer = data.soumissions.find(s => s.idOffre === idOffre);
      await api.put(`/soumissions/${idOffre}`, {
        ...offer,
        statut: newStatus,
        motif: rejectionMotif
      });
      fetchData();
      setShowMotifModal(false);
      setMotif('');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

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

    // 3. Filtrage par statut
    if (selectedStatus !== 'all') {
      result = result.filter(s => s.statut === selectedStatus);
    }

    // 4. Recherche textuelle intelligente
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
  }, [data.soumissions, period, searchQuery, selectedMarketId, selectedStatus]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Chargement des soumissions...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header avec Titre et Filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            Analyse des Offres
          </h1>
          <p className="text-gray-500 mt-2">Examen et validation de la conformité des soumissions.</p>
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

          {/* Filtre Statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="conforme">Conforme</option>
              <option value="rejete">Rejeté</option>
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
          {(searchQuery || selectedMarketId !== 'all' || period !== 'all' || selectedStatus !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedMarketId('all');
                setPeriod('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Résumé Statistique */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Offres</p>
            <h3 className="text-2xl font-black text-gray-900">{filteredSoumissions.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">En Attente</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.filter(s => s.statut === 'en attente').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Conformes</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.filter(s => s.statut === 'conforme').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Rejetées</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.filter(s => s.statut === 'rejete').length}</h3>
          </div>
        </div>
      </div>

      {/* Tableau des Soumissionnaires */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSoumissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-gray-400 italic">
                    Aucun soumissionnaire trouvé.
                  </td>
                </tr>
              ) : (
                filteredSoumissions.map(s => (
                  <tr key={s.idOffre} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{s.nomSoumissionnaire}</div>
                      <div className="text-xs text-gray-500">{s.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-gray-700">Marché #{s.idMarche}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{s.referenceAppelOffre}</div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-sm font-black text-primary">{Number(s.montantPropose).toLocaleString()} FBU</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.statut === 'conforme' ? 'bg-emerald-100 text-emerald-700' :
                        s.statut === 'rejete' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {s.statut}
                      </span>
                      {s.motif && s.statut === 'rejete' && (
                        <div className="text-[10px] text-red-400 italic mt-1 max-w-[200px] truncate" title={s.motif}>
                          Motif: {s.motif}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {s.statut === 'en attente' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(s.idOffre, 'conforme')}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                              title="Marquer comme conforme"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setCurrentOffer(s);
                                setShowMotifModal(true);
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              title="Rejeter l'offre"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {s.statut !== 'en attente' && (
                          <button 
                            onClick={() => handleStatusUpdate(s.idOffre, 'en attente')}
                            className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors"
                          >
                            RÉINITIALISER
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

      {/* Modal Motif de Rejet */}
      {showMotifModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-red-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Rejeter l'Offre</h2>
              <button onClick={() => setShowMotifModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-gray-600 text-sm">
                Veuillez indiquer la raison du rejet pour l'offre de <strong>{currentOffer?.nomSoumissionnaire}</strong>.
              </p>
              <textarea 
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm h-32"
                placeholder="Ex: Dossier technique incomplet, caution de soumission manquante..."
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowMotifModal(false)}
                  className="px-6 py-2.5 text-gray-500 font-bold text-sm"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleStatusUpdate(currentOffer.idOffre, 'rejete', motif)}
                  disabled={!motif.trim()}
                  className="px-8 py-2.5 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CgmpSoumissions;

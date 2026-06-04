import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Building, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  X,
  Settings,
  Star,
  Calculator
} from 'lucide-react';

import CriteresModal from './CriteresModal';
import EvalModal from './EvalModal';

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
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [showCriteresModal, setShowCriteresModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [targetOffer, setTargetOffer] = useState(null);
  const [isRanking, setIsRanking] = useState(false);
  
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

  const selectedMarket = useMemo(() => {
    if (selectedMarketId === 'all') return null;
    return data.marches.find(m => m.idMarche.toString() === selectedMarketId);
  }, [selectedMarketId, data.marches]);

  const handleRank = async () => {
    if (!selectedMarketId || selectedMarketId === 'all') return;
    setIsRanking(true);
    try {
      await api.post(`/marches/${selectedMarketId}/rank`);
      fetchData();
      alert("Mieux-disant identifié : offre la plus proche du montant estimé du marché (≥ budget, dans la tolérance autorisée).");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du calcul du classement.");
    } finally {
      setIsRanking(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Chargement des soumissions...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header avec Titre et Filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            Soumissionnaires
          </h1>
          <p className="text-gray-500 mt-2">Consultation des offres enregistrées par le réceptionniste.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filtre Marché */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tous les marchés</option>
              {data.marches.map(m => (
                <option key={m.idMarche} value={m.idMarche}>
                  Marché #{m.idMarche} — {m.numeroBudget || 'Sans réf.'}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
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
              className="pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64"
            />
          </div>

          {/* Boutons d'Action Conditionnels */}
          {selectedMarketId !== 'all' && (
            <div className="flex gap-2 border-l border-gray-200 pl-3">
              <button 
                onClick={() => setShowCriteresModal(true)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Settings size={16} /> Paramètres Évaluation
              </button>
              
              <button 
                onClick={handleRank}
                disabled={isRanking}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Calculator size={16} /> {isRanking ? 'Calcul...' : 'Calculer Classement'}
              </button>
            </div>
          )}

          {/* Bouton Reset */}
          {(searchQuery || selectedMarketId !== 'all' || period !== 'all' || selectedStatus !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedMarketId('all');
                setPeriod('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Résumé Statistique */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Offres</p>
            <h3 className="text-2xl font-black text-gray-900">{filteredSoumissions.length}</h3>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">En Attente</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.filter(s => s.statut === 'en attente').length}</h3>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Conformes</p>
            <h3 className="text-2xl font-black text-gray-900">{data.soumissions.filter(s => s.statut === 'conforme').length}</h3>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
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
      <div className="bg-surface rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
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
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{s.scoreGlobal ? `${s.scoreGlobal} pts` : '-'}</div>
                      {s.recommande === 1 && (
                        <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-full mt-1 w-max">
                          <Star size={12} className="fill-indigo-700" /> MIEUX DISANT
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap text-xs font-bold text-gray-400">
                      <div className="flex items-center justify-end gap-2">
                        {selectedMarketId !== 'all' && (
                          <button 
                            onClick={() => { setTargetOffer(s); setShowEvalModal(true); }}
                            className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors flex items-center gap-1"
                            title="Évaluer"
                          >
                            <FileText size={16} /> Évaluer
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedOffer(s); setShowModal(true); }}
                          className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Eye size={16} /> Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Soumissionnaire */}
      {showModal && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="bg-primary px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Détails de l&apos;Offre #{selectedOffer.idOffre}
                </h3>
                <p className="text-primary-100 text-sm mt-1">Marché concerné : #{selectedOffer.idMarche}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-white/20 hover:bg-white/40 p-2 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-8 space-y-8">
              {/* Info Principale */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shrink-0">
                  <Building size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">{selectedOffer.nomSoumissionnaire}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                      <Mail className="h-4 w-4" /> {selectedOffer.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                      <Phone className="h-4 w-4" /> {selectedOffer.telephone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Montant */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Montant Proposé</p>
                  <p className="text-2xl font-black text-primary">{Number(selectedOffer.montantPropose).toLocaleString()} FBU</p>
                </div>
                
                {/* Statut */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Statut Actuel</p>
                  <p className={`text-lg font-black uppercase ${
                        selectedOffer.statut === 'conforme' ? 'text-emerald-600' :
                        selectedOffer.statut === 'rejete' ? 'text-red-600' :
                        'text-amber-600'
                  }`}>
                    {selectedOffer.statut}
                  </p>
                </div>

                {/* Délai de livraison */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Clock className="h-4 w-4"/> Délai de Livraison</p>
                  <p className="text-sm font-bold text-gray-800">{selectedOffer.delaiLivraison || 'Non spécifié'}</p>
                </div>

                {/* Date soumission */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Calendar className="h-4 w-4"/> Date de Dépôt</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(selectedOffer.dateSoumission).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Adresse complète */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin className="h-4 w-4"/> Adresse Physique</p>
                <p className="text-sm font-bold text-gray-800">{selectedOffer.adresse || 'Non renseignée'}</p>
              </div>
            </div>
            
            {/* Footer Modal */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals d'Evaluation */}
      <CriteresModal 
        isOpen={showCriteresModal}
        onClose={() => setShowCriteresModal(false)}
        marketId={selectedMarketId}
        existingCriteres={selectedMarket?.criteresEvaluation}
        onSaveSuccess={fetchData}
      />
      <EvalModal
        isOpen={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        offer={targetOffer}
        marketCriteres={selectedMarket?.criteresEvaluation}
        onSaveSuccess={fetchData}
      />
    </div>
  );
};

export default CgmpSoumissions;

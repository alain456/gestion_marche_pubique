import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Package, MessageSquare, Info, Eye, Clock, History,
  User, XCircle, Building, ArrowLeft, CheckCircle, Filter
} from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const ToutesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [viewingDemande, setViewingDemande] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      // Appel sans paramètre => backend retourne toutes les demandes (grâce à la permission VOIR_TOUTES_DEMANDES)
      const res = await api.get('/demandes');
      setDemandes(res.data);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
      setError('Impossible de charger les demandes du système.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemandes();
  }, []);

  const fetchHistory = async (idDemande) => {
    setHistoryLoading(true);
    setHistoryData([]);
    setShowHistory(true);
    try {
      const res = await api.get(`/demandes/${idDemande}/history`);
      setHistoryData(res.data);
    } catch (err) {
      console.error('Erreur historique:', err);
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

  const getBackPath = () => {
    const role = user?.role?.toUpperCase().replace(/\s+/g, '_') || '';
    if (role === 'ADMIN') return '/admin';
    if (role === 'RAF') return '/raf';
    if (role === 'CHEF_INSTITUTION') return '/chef';
    if (role === 'CHEF_SERVICE') return '/demandeur';
    return '/demandeur';
  };

  const filteredDemandes = demandes.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      d.nomService?.toLowerCase().includes(searchLower) ||
      d.nomDemandeur?.toLowerCase().includes(searchLower) ||
      d.articles?.some(a => a.nomArticle?.toLowerCase().includes(searchLower)) ||
      d.idDemande.toString().includes(searchLower);
    const matchStatut = !filterStatut || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // Séparer mes demandes des autres
  const mesDemandes = filteredDemandes.filter(d => Number(d.idUser) === Number(user?.idUser));
  const autresDemandes = filteredDemandes.filter(d => Number(d.idUser) !== Number(user?.idUser));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Chargement des demandes du système...</span>
      </div>
    );
  }

  const DemandeCard = ({ demande, isMine }) => {
    const borderColor =
      demande.statut === 'Valide' ? 'border-l-emerald-400' :
      demande.statut === 'Rejete' ? 'border-l-red-400' :
      demande.statut === 'En attente' ? 'border-l-amber-400' :
      demande.statut === 'Brouillon' ? 'border-l-gray-300' : 'border-l-gray-200';

    return (
      <div className={`bg-surface rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-4 hover:shadow-md transition-shadow`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* Colonne gauche */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{demande.idDemande}</span>
              <span className="text-[10px] text-gray-400">{new Date(demande.dateDemande).toLocaleDateString('fr-FR')}</span>
              {isMine && (
                <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 mt-1">
                  Ma création
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {/* Infos service + demandeur */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-bold text-blue-700">{demande.numeroBudget || '— Budget'}</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 uppercase tracking-tighter">
                  <Building className="h-3 w-3" /> {demande.nomService || 'Service Inconnu'}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <User className="h-3 w-3" /> {demande.nomDemandeur || 'Inconnu'}
                </span>
              </div>
              {/* Articles */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {demande.articles?.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex flex-col bg-gray-50 border border-gray-100 rounded px-2 py-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Package className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700">{a.nomArticle}</span>
                      <span className="text-gray-400 font-mono">×{a.quantite}</span>
                    </div>
                  </div>
                ))}
                {demande.articles?.length > 3 && (
                  <span className="text-[10px] text-primary font-semibold bg-blue-50 border border-blue-100 px-2 py-1 rounded self-center">
                    +{demande.articles.length - 3} autres
                  </span>
                )}
              </div>
              {/* Statut + Motif */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatutBadge(demande.statut)}`}>
                  {demande.statut}
                </span>
                {demande.modifieParCgmp === 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Ajusté CGMP
                  </span>
                )}
              </div>
              {demande.motif && (
                <div className={`mt-2 p-2 rounded-lg border text-xs max-w-lg ${
                  demande.statut === 'Rejete' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  <span className="font-bold">Note / Motif : </span>
                  <span className="italic">{demande.motif}</span>
                </div>
              )}
            </div>
          </div>
          {/* Colonne droite */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <p className="text-[9px] text-gray-400 uppercase font-bold">Montant total</p>
              <p className="text-sm font-bold text-gray-800">
                {demande.articles?.reduce((acc, art) => acc + (art.montant || 0), 0).toLocaleString()} FBU
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchHistory(demande.idDemande)} className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-100 transition" title="Historique">
                <History className="h-4 w-4" />
              </button>
              <button onClick={() => setViewingDemande(demande)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg border border-blue-100 transition" title="Visualiser">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Filter className="h-6 w-6 text-primary" />
            Toutes les Demandes du Système
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Vue globale — {demandes.length} demande(s) au total dans le système.
          </p>
        </div>
        <Link
          to={getBackPath()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par #ID, service, demandeur ou article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-gray-300 pl-10 py-2.5"
          />
        </div>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="rounded-xl border-gray-300 bg-surface min-w-[180px]">
          <option value="">Tous les statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="Soumis">Soumis</option>
          <option value="En attente">En attente</option>
          <option value="Valide">Validé</option>
          <option value="Rejete">Rejeté</option>
          <option value="Inclus dans Marché">Inclus dans Marché</option>
        </select>
      </div>

      {/* === Section 1 : Mes demandes dans la liste globale === */}
      {mesDemandes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-0.5 flex-1 bg-primary/20"></div>
            <h2 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />
              Mes créations ({mesDemandes.length})
            </h2>
            <div className="h-0.5 flex-1 bg-primary/20"></div>
          </div>
          {mesDemandes.map(d => <DemandeCard key={d.idDemande} demande={d} isMine={true} />)}
        </section>
      )}

      {/* === Section 2 : Demandes des autres utilisateurs === */}
      {autresDemandes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-0.5 flex-1 bg-gray-200"></div>
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Building className="h-4 w-4" />
              Demandes des autres services ({autresDemandes.length})
            </h2>
            <div className="h-0.5 flex-1 bg-gray-200"></div>
          </div>
          {autresDemandes.map(d => <DemandeCard key={d.idDemande} demande={d} isMine={false} />)}
        </section>
      )}

      {filteredDemandes.length === 0 && (
        <div className="bg-surface rounded-xl px-6 py-12 text-center text-gray-400 border border-gray-100 shadow-sm">
          Aucune demande trouvée.
        </div>
      )}

      {/* Modal Visualisation */}
      {viewingDemande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Détails de la demande #{viewingDemande.idDemande}</h3>
                <p className="text-sm text-gray-500">
                  Service: {viewingDemande.nomService} | Demandeur: {viewingDemande.nomDemandeur}
                </p>
              </div>
              <button onClick={() => setViewingDemande(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Désignation</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantité</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">P.U (FBU)</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Spécifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewingDemande.articles.map((art, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium">{art.nomArticle}</td>
                      <td className="px-4 py-3 text-sm text-center">{art.quantite}</td>
                      <td className="px-4 py-3 text-sm font-bold text-primary text-right">{art.montant ? art.montant.toLocaleString() + ' FBU' : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 italic">{art.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-right">Total:</td>
                    <td colSpan="2" className="px-4 py-3 text-primary">
                      {viewingDemande.articles.reduce((acc, art) => acc + (art.montant || 0), 0).toLocaleString()} FBU
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 text-right bg-gray-50 rounded-b-xl">
              <button onClick={() => setViewingDemande(null)} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historique */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">Historique Complet</h3>
                  <p className="text-blue-200 text-xs font-bold opacity-80 uppercase tracking-tighter">Audit Trail</p>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle className="h-7 w-7" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Récupération...</p>
                </div>
              ) : historyData.length === 0 ? (
                <p className="text-center py-12 text-gray-500 font-bold uppercase text-xs tracking-widest">Aucun historique disponible.</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-8">
                  {historyData.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className={`absolute left-[-41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                        item.nouveauStatut === 'Valide' ? 'bg-emerald-500' :
                        item.nouveauStatut === 'Rejete' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.action}</h4>
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border border-gray-200">
                            {new Date(item.dateAction).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{item.nomUtilisateur}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">({item.roleUtilisateur})</span>
                        </div>
                        {item.nouveauStatut && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatutBadge(item.nouveauStatut)}`}>
                            {item.nouveauStatut}
                          </span>
                        )}
                        {item.motif && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800 italic flex gap-2">
                            <Info className="h-4 w-4 shrink-0 text-amber-500" />
                            <span>"{item.motif}"</span>
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

export default ToutesDemandes;

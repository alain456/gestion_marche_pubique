import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, Package, Info } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const DemandeurDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        // Récupérer les demandes du service de l'utilisateur
        const res = await api.get('/demandes?mesdemandes=true');
        setDemandes(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des demandes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, []);

  const handleMarkAsRead = async (idDemande) => {
    try {
      await api.put(`/demandes/${idDemande}/mark-vue`);
      // Mettre à jour l'état local pour faire disparaître l'alerte
      setDemandes(demandes.map(d => 
        d.idDemande === idDemande ? { ...d, alerteVue: 1 } : d
      ));
      navigate('/demandeur/demandes');
    } catch (err) {
      console.error('Erreur lors du marquage de l\'alerte:', err);
    }
  };

  // Calculer les statistiques
  const totalDemandes = demandes.length;
  const brouillons = demandes.filter(d => d.statut === 'Brouillon').length;
  const enAttenteBudget = demandes.filter(d => d.statut === 'En attente').length;
  const approuvees = demandes.filter(d => d.statut === 'Valide').length;
  const rejetees = demandes.filter(d => d.statut === 'Rejete').length;

  // Normalisation du rôle pour les conditions d'affichage
  const userRole = user?.role?.toUpperCase().replace(/\s+/g, '_');
  const isChef = userRole === 'CHEF_SERVICE' || userRole === 'CHEF_INSTITUTION' || userRole === 'RAF';

  // Dernières demandes (les 5 plus récentes)
  const dernieresDemandes = demandes.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">
            Tableau de Bord — {user?.nomService || 'Service Demandeur'}
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, <span className="font-medium">{user?.nom || 'Utilisateur'}</span>. Gérez vos demandes d&apos;achat ici.
          </p>
        </div>
        <Link
          to="/demandeur/demandes"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          Nouvelle demande
        </Link>
      </div>

      {/* Alertes & Notifications */}
      {(demandes.some(d => (d.modifieParCgmp === 1 || (d.statut === 'Rejete' && d.renvoyee === 1)) && d.alerteVue === 0)) && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4" /> Alertes récentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demandes.filter(d => d.modifieParCgmp === 1 && d.alerteVue === 0).slice(0, 2).map(d => (
              <div key={`adj-${d.idDemande}`} className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Info className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900">Ajustement technique CGMP</p>
                  <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
                    La demande <span className="font-bold">#{d.idDemande}</span> a été ajustée (quantités/prix) par la CGMP pour être incluse dans un marché.
                  </p>
                  <button 
                    onClick={() => handleMarkAsRead(d.idDemande)}
                    className="text-[10px] font-black uppercase text-purple-600 mt-2 inline-block hover:underline"
                  >
                    Consulter les modifications
                  </button>
                </div>
              </div>
            ))}
            {demandes.filter(d => d.statut === 'Rejete' && d.renvoyee === 1 && d.alerteVue === 0).slice(0, 2).map(d => (
              <div key={`rej-${d.idDemande}`} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-right-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <XCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">Demande à corriger</p>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                    La demande <span className="font-bold">#{d.idDemande}</span> a été rejetée. Veuillez consulter le motif et la soumettre à nouveau.
                  </p>
                  <button 
                    onClick={() => handleMarkAsRead(d.idDemande)}
                    className="text-[10px] font-black uppercase text-red-600 mt-2 inline-block hover:underline"
                  >
                    Corriger maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-primary rounded-lg">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Demandes</p>
            <p className="text-2xl font-semibold text-gray-900">{totalDemandes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-gray-100 text-gray-500 rounded-lg">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Brouillons</p>
            <p className="text-2xl font-semibold text-gray-900">{brouillons}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En attente</p>
            <p className="text-2xl font-semibold text-gray-900">{enAttenteBudget}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition group">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Validées</p>
            <p className="text-2xl font-semibold text-gray-900">{approuvees}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <XCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rejetées</p>
            <p className="text-2xl font-semibold text-gray-900">{rejetees}</p>
          </div>
        </div>
      </div>

      {/* Dernières demandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Dernières demandes</h2>
          <Link
            to="/demandeur/demandes"
            className="text-sm text-primary hover:underline font-medium"
          >
            Voir toutes →
          </Link>
        </div>

        {dernieresDemandes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune demande pour le moment.</p>
            <Link
              to="/demandeur/demandes"
              className="inline-flex items-center gap-1 mt-3 text-primary hover:underline text-sm font-medium"
            >
              <PlusCircle className="h-4 w-4" />
              Créer votre première demande
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                  {!isChef && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {dernieresDemandes.map((demande, index) => (
                  <tr key={demande.idDemande || index} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-medium">{demande.articles?.[0]?.nomArticle || 'N/A'}</span>
                          {demande.articles?.length > 1 && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-tight">+{demande.articles.length - 1} autres</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {!isChef && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {demande.typeMarche}
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                      {demande.articles?.[0]?.quantite || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {demande.dateDemande ? new Date(demande.dateDemande).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          demande.statut === 'Brouillon'
                            ? 'bg-gray-100 text-gray-600 border border-gray-300'

                            : demande.statut === 'En attente'
                            ? 'bg-amber-100 text-amber-800'
                            : demande.statut === 'Valide'
                            ? 'bg-green-100 text-green-800'
                            : demande.statut === 'Rejete'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {demande.statut}
                        </span>
                        {demande.renvoyee === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Renvoyée
                          </span>
                        )}
                        {demande.modifieParCgmp === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Ajusté CGMP
                          </span>
                        )}
                        

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions Rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/demandeur/demandes"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle demande d&apos;achat
          </Link>
          <Link
            to="/demandeur/demandes"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <FileText className="h-4 w-4" />
            Voir mes demandes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemandeurDashboard;

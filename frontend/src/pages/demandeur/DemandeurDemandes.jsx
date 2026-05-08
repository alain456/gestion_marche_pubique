import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Search, Trash2, ListPlus, Pencil, Save, Send, Package } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const DemandeurDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // ID de la demande en cours de modification (null si nouvelle)
  const [editingId, setEditingId] = useState(null);

  const { user } = useContext(AuthContext);

  // Liste des articles ajoutés à la demande actuelle
  const [selectedItems, setSelectedItems] = useState([]);
  
  // État pour l'article en cours de saisie
  const [currentItem, setCurrentItem] = useState({
    idArticle: '',
    quantite: '',
    description: '',
  });

  const [form, setForm] = useState({
    idService: user?.idService || '',
    typeMarche: '',
    idBudget: ''
  });

  const loadDemandes = async () => {
    try {
      const res = await api.get('/demandes?mesdemandes=true');
      setDemandes(res.data);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
      setError('Impossible de charger les demandes.');
    }
  };

  const loadArticles = async () => {
    try {
      const res = await api.get('/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
    }
  };

  const loadBudgets = async () => {
    try {
      const res = await api.get('/budgets/ouverts');
      setBudgets(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDemandes(), loadArticles(), loadBudgets()]);
      setLoading(false);
    };
    init();
  }, [user]);

  const resetForm = () => {
    setForm({ idService: user?.idService || '', typeMarche: '', idBudget: '' });
    setSelectedItems([]);
    setCurrentItem({ idArticle: '', quantite: '', description: '' });
    setEditingId(null);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e, isDraft = false) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');

    if (!user?.idService && userRole !== 'RAF') {
      setError('ID service manquant.');
      return;
    }

    let finalItems = [...selectedItems];
    if (currentItem.idArticle && currentItem.quantite) {
      const article = articles.find(a => a.idArticle === parseInt(currentItem.idArticle));
      finalItems.push({
        idArticle: parseInt(currentItem.idArticle),
        nomArticle: article?.nomArticle,
        quantite: parseInt(currentItem.quantite),
        description: currentItem.description
      });
    }

    if (finalItems.length === 0) {
      setError('Veuillez ajouter au moins un article.');
      return;
    }

    try {
      const statut = isDraft ? 'Brouillon' : 'En attente';
      const payload = {
        idService: form.idService ? parseInt(form.idService) : null,
        typeMarche: form.typeMarche,
        statut: statut,
        articles: finalItems,
        idBudget: parseInt(form.idBudget),
        motif: statut === 'En attente' ? null : undefined // Effacer le motif si on soumet
      };

      if (editingId) {
        await api.put(`/demandes/${editingId}`, payload);
        setMessage(`Commande #${editingId} mise à jour avec succès.`);
      } else {
        await api.post('/demandes', payload);
        setMessage(`Nouvelle commande créée avec succès.`);
      }

      resetForm();
      setShowForm(false);
      loadDemandes();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  const handleBudgetChange = (idBudget) => {
    const budget = budgets.find(b => b.idBudget === parseInt(idBudget));
    setForm({
      ...form,
      idBudget: idBudget,
      typeMarche: budget ? budget.typeBudget : ''
    });
    // Si on change de budget, on vide le panier car les types peuvent être différents
    if (selectedItems.length > 0) {
      if (window.confirm("Changer de ligne budgétaire videra votre liste d'articles car les types peuvent différer. Continuer ?")) {
        setSelectedItems([]);
      } else {
        return;
      }
    }
  };

  const addArticleToList = () => {
    if (!currentItem.idArticle || !currentItem.quantite || currentItem.quantite <= 0) {
      alert("Veuillez choisir un article et une quantité valide.");
      return;
    }
    
    const articleData = articles.find(a => a.idArticle === parseInt(currentItem.idArticle));
    setSelectedItems([...selectedItems, { ...currentItem, nomArticle: articleData?.nomArticle }]);
    setCurrentItem({ idArticle: '', quantite: '', description: '' });
  };

  const editArticleInList = (index) => {
    const item = selectedItems[index];
    setCurrentItem({
      idArticle: item.idArticle.toString(),
      quantite: item.quantite,
      description: item.description || '',
    });
    removeArticleFromList(index);
  };

  const removeArticleFromList = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const reprendreDemande = (demande) => {
    setEditingId(demande.idDemande);
    setForm({
      idService: demande.idService,
      idBudget: demande.idBudget,
      typeMarche: demande.typeMarche,
    });
    setSelectedItems(demande.articles.map(art => ({
      idArticle: art.idArticle,
      nomArticle: art.nomArticle,
      quantite: art.quantite,
      description: art.description || ''
    })));
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finaliserDemande = async (idDemande) => {
    try {
      const statut = isChef ? 'En attente' : 'Soumis';
      await api.put(`/demandes/${idDemande}/statut`, { statut: statut });
      setMessage(isChef ? 'Commande envoyée au RAF !' : 'Commande soumise à votre Chef de Service !');
      loadDemandes();
    } catch (error) {
      console.error(error);
      setError('Erreur lors de la soumission.');
    }
  };

  const handleDeleteDemande = async (idDemande) => {
    if (!window.confirm("Supprimer cette commande et tous ses articles ?")) return;
    try {
      await api.delete(`/demandes/${idDemande}`);
      setMessage("Commande supprimée.");
      loadDemandes();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression.");
    }
  };

  const userRole = user?.role?.toUpperCase().replace(/\s+/g, '_');
  const isChef = userRole === 'CHEF_SERVICE' || userRole === 'CHEF_INSTITUTION' || userRole === 'RAF';

  const filteredDemandes = demandes.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      d.nomService?.toLowerCase().includes(searchLower) ||
      d.articles.some(a => a.nomArticle?.toLowerCase().includes(searchLower)) ||
      d.idDemande.toString().includes(searchLower);
    const matchStatut = !filterStatut || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const getStatutBadge = (statut) => {
    const styles = {
      'Brouillon': 'bg-gray-100 text-gray-600 border border-gray-300',
      'Soumis': 'bg-blue-100 text-blue-800',
      'En attente': 'bg-amber-100 text-amber-800',
      'Valide': 'bg-green-100 text-green-800',
      'Rejete': 'bg-red-100 text-red-800',
    };
    return styles[statut] || 'bg-gray-100 text-gray-800';
  };

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Commandes d&apos;Achat</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes groupées par ligne budgétaire.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/demandeur" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg shadow-sm">
            <PlusCircle className="h-5 w-5" /> {showForm ? 'Fermer' : 'Nouvelle commande'}
          </button>
        </div>
      </div>

      {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">{message}</div>}
      {error && !showForm && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

      {/* Formulaire */}
      {showForm && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? `Modifier la Commande #${editingId}` : 'Nouvelle Commande'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ligne Budgétaire (Container)</label>
              <select 
                value={form.idBudget} 
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full rounded-lg border-gray-300 py-2 text-sm"
              >
                <option value="">Sélectionner un budget...</option>
                {budgets.map(b => (
                  <option key={b.idBudget} value={b.idBudget}>{b.numeroBudget} ({b.typeBudget})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type de marché déduit</label>
              <input type="text" value={form.typeMarche || 'Sélectionnez un budget'} disabled className="w-full rounded-lg border-gray-300 bg-gray-50 py-2 text-sm capitalize" />
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <ListPlus className="h-4 w-4" /> Ajouter des articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Article</label>
                <select 
                  value={currentItem.idArticle} 
                  onChange={(e) => setCurrentItem({...currentItem, idArticle: e.target.value})} 
                  className="w-full rounded-lg border-gray-300 py-2 text-sm bg-white"
                  disabled={!form.idBudget}
                >
                  <option value="">{form.idBudget ? 'Choisir un article...' : 'Sélectionnez d\'abord un budget'}</option>
                  {articles
                    .filter(a => !form.idBudget || a.typeArticle === form.typeMarche)
                    .map((a) => <option key={a.idArticle} value={a.idArticle}>{a.nomArticle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                <input type="number" min="1" value={currentItem.quantite} onChange={(e) => setCurrentItem({...currentItem, quantite: e.target.value})} className="w-full rounded-lg border-gray-300 py-2 text-sm" placeholder="Ex: 10" />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button 
                  type="button"
                  onClick={addArticleToList}
                  className="w-full h-10 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" /> Ajouter
                </button>
              </div>
              <div className="md:col-span-3">
                <input type="text" value={currentItem.description} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} className="w-full rounded-lg border-gray-300 py-2 text-sm" placeholder="Description / Spécifications (optionnel)" />
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr><th className="px-3 py-2 text-left">Article</th><th className="px-3 py-2 text-left">Qté</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium">{item.nomArticle}</td>
                        <td className="px-3 py-2">{item.quantite}</td>
                        <td className="px-3 py-2 text-gray-500 italic">{item.description || '—'}</td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button onClick={() => editArticleInList(idx)} className="text-blue-500"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => removeArticleFromList(idx)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={(e) => handleSubmit(e, false)} 
              disabled={selectedItems.length === 0 && !currentItem.idArticle} 
              className={`inline-flex items-center px-6 py-2.5 rounded-xl text-white font-medium transition ${
                (selectedItems.length > 0 || currentItem.idArticle) ? 'bg-primary hover:bg-blue-800 shadow-md' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4 mr-2" /> {editingId ? 'Mettre à jour et Soumettre' : 'Soumettre la commande'}
            </button>
            <button 
              onClick={(e) => handleSubmit(e, true)} 
              disabled={selectedItems.length === 0 && !currentItem.idArticle} 
              className={`inline-flex items-center px-6 py-2.5 rounded-xl font-medium border transition ${
                (selectedItems.length > 0 || currentItem.idArticle) ? 'bg-white border-primary text-primary hover:bg-blue-50' : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" /> Enregistrer Brouillon
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition">Annuler</button>
          </div>
        </section>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par #ID, service ou article..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border-gray-300 pl-10 py-2.5" />
        </div>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="rounded-xl border-gray-300 bg-white min-w-[180px]">
          <option value="">Tous les statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="En attente">En attente</option>
          <option value="Valide">Valide</option>
          <option value="Rejete">Rejete</option>
        </select>
      </div>

      {/* Tableau des commandes groupées */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase"># ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Articles</th>
                {!isChef && (
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr><td colSpan={isChef ? "5" : "6"} className="px-4 py-12 text-center text-gray-500">Aucune commande trouvée.</td></tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr key={demande.idDemande} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-sm">#{demande.idDemande}</td>
                    <td className="px-4 py-4 font-bold text-sm text-blue-700">{demande.numeroBudget || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {demande.articles.slice(0, 2).map((a, i) => (
                          <div key={i} className="text-sm flex flex-col gap-0.5 border-b border-gray-50 pb-1.5 last:border-0">
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{a.nomArticle}</span>
                              <span className="text-gray-400 text-xs font-mono">x{a.quantite}</span>
                            </div>
                            {a.prixUnitaire > 0 && (
                              <div className="pl-5 flex justify-between items-center text-[10px]">
                                <span className="text-gray-400">{Number(a.prixUnitaire).toLocaleString()} FBU /unité</span>
                                <span className="font-bold text-primary">{ (a.prixUnitaire * a.quantite).toLocaleString() } FBU</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {demande.articles.length > 2 && (
                          <span className="text-xs text-primary font-semibold">+{demande.articles.length - 2} autres articles</span>
                        )}
                      </div>
                    </td>
                    {!isChef && (
                      <td className="px-4 py-4 text-sm capitalize">{demande.typeMarche}</td>
                    )}
                    <td className="px-4 py-4 text-sm text-gray-500">{new Date(demande.dateDemande).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${getStatutBadge(demande.statut)}`}>
                          {demande.statut}
                        </span>
                        {demande.motif && (
                          <p className="text-[10px] text-gray-400 italic max-w-[150px] leading-tight">
                            {demande.motif}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                      {demande.statut === 'Brouillon' && (
                        <>
                          <button onClick={() => reprendreDemande(demande)} className="text-blue-600 hover:underline font-semibold text-sm">Reprendre</button>
                          <button onClick={() => finaliserDemande(demande.idDemande)} className="text-primary hover:underline font-semibold text-sm">Soumettre</button>
                        </>
                      )}
                      {demande.statut === 'Rejete' && (
                        <button onClick={() => reprendreDemande(demande)} className="text-amber-600 hover:underline font-semibold text-sm">Corriger & Renvoyer</button>
                      )}
                      {(demande.statut === 'Brouillon' || demande.statut === 'En attente' || demande.statut === 'Rejete') && (
                        <button onClick={() => handleDeleteDemande(demande.idDemande)} className="text-red-500 hover:text-red-700" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DemandeurDemandes;

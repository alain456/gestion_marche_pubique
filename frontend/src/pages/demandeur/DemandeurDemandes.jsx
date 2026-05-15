import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Search, Trash2, ListPlus, Pencil, Save, Send, Package, MessageSquare, Info, Eye, Clock, Gavel, History, User, XCircle } from 'lucide-react';

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
  
  // Demande sélectionnée pour la visualisation
  const [viewingDemande, setViewingDemande] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { user } = useContext(AuthContext);

  // Liste des articles ajoutés à la demande actuelle
  const [selectedItems, setSelectedItems] = useState([]);
  
  // État pour l'article en cours de saisie
  const [currentItem, setCurrentItem] = useState({
    idArticle: '',
    quantite: '',
    description: '',
    montant: ''
  });

  const [form, setForm] = useState({
    idService: user?.idService || '',
    typeMarche: '',
    idBudget: '',
    priorite: 'Normale'
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
    setForm({ idService: user?.idService || '', typeMarche: '', idBudget: '', priorite: 'Normale' });
    setSelectedItems([]);
    setCurrentItem({ idArticle: '', quantite: '', description: '', montant: '' });
    setEditingId(null);
    setError('');
    setMessage('');
  };

  const fetchHistory = async (idDemande) => {
    setHistoryLoading(true);
    setHistoryData([]);
    setShowHistory(true);
    try {
      const res = await api.get(`/demandes/${idDemande}/history`);
      setHistoryData(res.data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setHistoryLoading(false);
    }
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
        description: currentItem.description,
        montant: currentItem.montant ? parseInt(currentItem.montant) : null
      });
    }

    if (finalItems.length === 0) {
      setError('Veuillez ajouter au moins un article.');
      return;
    }

    try {
      const statut = isDraft ? 'Brouillon' : (isChef ? 'En attente' : 'Soumis');
      const payload = {
        idService: form.idService ? parseInt(form.idService) : null,
        typeMarche: form.typeMarche,
        priorite: form.priorite,
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
      typeMarche: budget ? budget.typeBudget.toLowerCase() : ''
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
    
    const articleIdNum = parseInt(currentItem.idArticle);
    const articleData = articles.find(a => a.idArticle === articleIdNum);
    
    if (!articleData) {
      alert("Erreur: L'article sélectionné est introuvable.");
      return;
    }
    
    setSelectedItems([...selectedItems, { 
      idArticle: articleIdNum, 
      nomArticle: articleData.nomArticle,
      quantite: parseInt(currentItem.quantite),
      description: currentItem.description,
      montant: currentItem.montant ? parseInt(currentItem.montant) : null
    }]);
    setCurrentItem({ idArticle: '', quantite: '', description: '', montant: '' });
  };

  const editArticleInList = (index) => {
    const item = selectedItems[index];
    setCurrentItem({
      idArticle: item.idArticle?.toString() || '',
      quantite: item.quantite,
      description: item.description || '',
      montant: item.montant?.toString() || ''
    });
    removeArticleFromList(index);
  };

  const removeArticleFromList = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const reprendreDemande = (demande) => {
    setEditingId(demande.idDemande);
    setForm({
      idService: demande.idService || '',
      idBudget: demande.idBudget || '',
      typeMarche: demande.typeMarche ? demande.typeMarche.toLowerCase() : '',
      priorite: demande.priorite || 'Normale'
    });
    setSelectedItems(demande.articles.map(art => ({
      idArticle: art.idArticle,
      nomArticle: art.nomArticle,
      quantite: art.quantite,
      description: art.description || '',
      montant: art.montant || null
    })));
    setCurrentItem({ idArticle: '', quantite: '', description: '', montant: '' });
    
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
      'Inclus dans Marché': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isChef ? 'Mes Demandes Personnelles' : 'Mes Commandes d\'Achat'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isChef
              ? `Bienvenue ${user?.nom}. Vos demandes créées personnellement.`
              : 'Gérez vos demandes groupées par ligne budgétaire.'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to={isChef ? '/chef' : '/demandeur'} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300"
          >
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
        <section className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? `Modifier la Commande #${editingId}` : 'Nouvelle Commande'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Ligne Budgétaire (Conteneur)
              </label>
              <select 
                value={form.idBudget} 
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              >
                <option value="">-- Sélectionner l&apos;enveloppe budgétaire --</option>
                {budgets.map(b => (
                  <option key={b.idBudget} value={b.idBudget}>{b.numeroBudget} | {b.typeBudget}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Gavel className="h-4 w-4 text-primary" /> Catégorie de Marché
              </label>
              <input 
                type="text" 
                value={form.typeMarche || 'En attente de sélection...'} 
                disabled 
                className="w-full rounded-xl border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-tight shadow-inner" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Niveau de Priorité
              </label>
              <select 
                value={form.priorite} 
                onChange={(e) => setForm({...form, priorite: e.target.value})}
                className="w-full rounded-xl border-gray-200 bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              >
                <option value="Normale">Normale</option>
                <option value="Urgente">Urgente</option>
                <option value="Critique">Critique</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <ListPlus className="h-5 w-5 text-emerald-600" /> Composition de la Commande
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Étape 2: Ajout d&apos;articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Nom de l&apos;Article</label>
                <select 
                  value={currentItem.idArticle} 
                  onChange={(e) => setCurrentItem({...currentItem, idArticle: e.target.value})} 
                  className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm bg-surface shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                  disabled={!form.idBudget}
                >
                  <option value="">{form.idBudget ? 'Chercher un article...' : 'Sélectionnez d&apos;abord un budget'}</option>
                  {articles
                    .filter(a => {
                      if (!form.idBudget) return false;
                      const typeA = a.typeArticle?.toLowerCase();
                      const typeM = form.typeMarche?.toLowerCase();
                      return typeA === typeM;
                    })
                    .map((a) => <option key={a.idArticle} value={a.idArticle}>{a.nomArticle}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Qté Demandée</label>
                <input 
                  type="number" 
                  min="1" 
                  value={currentItem.quantite} 
                  onChange={(e) => setCurrentItem({...currentItem, quantite: e.target.value})} 
                  className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="00" 
                />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">P.U Estimé (FBU)</label>
                <input 
                  type="number" 
                  min="0" 
                  value={currentItem.montant} 
                  onChange={(e) => setCurrentItem({...currentItem, montant: e.target.value})} 
                  className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 font-mono text-emerald-700 font-bold" 
                  placeholder="Ex: 50000" 
                />
              </div>
              <div className="md:col-span-3">
                <button 
                  type="button"
                  onClick={addArticleToList}
                  className="w-full h-[42px] bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <PlusCircle className="h-4 w-4" /> Ajouter à la liste
                </button>
              </div>
              <div className="md:col-span-12 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Spécifications Techniques / Justifications</label>
                <input 
                  type="text" 
                  value={currentItem.description} 
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} 
                  className="w-full rounded-xl border-gray-200 py-3 px-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 italic bg-surface" 
                  placeholder="Précisez la marque, le modèle, la qualité ou tout autre détail important..." 
                />
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-surface">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Désignation</th>
                      <th className="px-3 py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qté</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">P.U Estimé</th>
                      <th className="px-3 py-2 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Spécifications</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium">{item.nomArticle}</td>
                        <td className="px-3 py-2">{item.quantite}</td>
                        <td className="px-3 py-2 font-semibold text-primary">{item.montant ? item.montant.toLocaleString() + ' FBU' : '—'}</td>
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
                (selectedItems.length > 0 || currentItem.idArticle) ? 'bg-surface border-primary text-primary hover:bg-blue-50' : 'bg-gray-50 text-gray-300 cursor-not-allowed'
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
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="rounded-xl border-gray-300 bg-surface min-w-[180px]">
          <option value="">Tous les statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="En attente">En attente</option>
          <option value="Valide">Valide</option>
          <option value="Rejete">Rejete</option>
          <option value="Inclus dans Marché">Inclus dans Marché</option>
        </select>
      </div>

      {/* Liste des commandes - Layout card responsive */}
      <section className="space-y-3">
        {filteredDemandes.length === 0 ? (
          <div className="bg-surface rounded-xl px-6 py-12 text-center text-gray-400 border border-gray-100 shadow-sm">Aucune commande trouvée.</div>
        ) : (
          filteredDemandes.map((demande) => {
            const borderColor =
              demande.statut === 'Valide' ? 'border-l-emerald-400' :
              demande.statut === 'Rejete' ? 'border-l-red-400' :
              demande.statut === 'En attente' ? 'border-l-amber-400' :
              demande.statut === 'Brouillon' ? 'border-l-gray-300' : 'border-l-gray-200';
            return (
              <div key={demande.idDemande} className={`bg-surface rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-4 hover:shadow-md transition-shadow`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Colonne gauche: ID + Budget + Articles */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{demande.idDemande}</span>
                      <span className="text-[10px] text-gray-400">{new Date(demande.dateDemande).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Budget + Type */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-blue-700">{demande.numeroBudget || '— Budget'}</span>
                        {!isChef && (
                          <span className="text-[10px] capitalize bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{demande.typeMarche}</span>
                        )}
                      </div>
                      {/* Articles */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {demande.articles.slice(0, 3).map((a, i) => (
                          <div key={i} className="flex flex-col bg-gray-50 border border-gray-100 rounded px-2 py-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Package className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="font-medium text-gray-700">{a.nomArticle}</span>
                              <span className="text-gray-400 font-mono">×{a.quantite}</span>
                            </div>
                            {a.prixUnitaire > 0 && (
                              <div className="pl-4 flex items-center gap-1 text-[10px] mt-0.5">
                                <span className="text-gray-400">{Number(a.prixUnitaire).toLocaleString()} /u</span>
                                <span className="text-primary font-bold">= {(a.prixUnitaire * a.quantite).toLocaleString()} FBU</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {demande.articles.length > 3 && (
                          <span className="text-[10px] text-primary font-semibold bg-blue-50 border border-blue-100 px-2 py-1 rounded self-center">
                            +{demande.articles.length - 3} autres
                          </span>
                        )}
                      </div>
                      {/* Statut + Badges + Motif */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatutBadge(demande.statut)}`}>
                          {demande.statut}
                        </span>
                        {demande.modifieParCgmp === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Ajusté CGMP
                          </span>
                        )}
                        {demande.renvoyee === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Renvoyée
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

                  {/* Colonne droite: Montant + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Montant total</p>
                      <p className="text-sm font-bold text-gray-800">
                        {demande.articles.reduce((acc, art) => acc + (art.montant || 0), 0).toLocaleString()} FBU
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fetchHistory(demande.idDemande)} className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-100 transition" title="Historique">
                        <History className="h-4 w-4" />
                      </button>
                      <button onClick={() => setViewingDemande(demande)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg border border-blue-100 transition" title="Visualiser">
                        <Eye className="h-4 w-4" />
                      </button>
                      {(demande.statut === 'Brouillon' || demande.statut === 'En attente' || demande.statut === 'Rejete') && (
                        <button onClick={() => reprendreDemande(demande)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg border border-amber-100 transition" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {demande.statut === 'Brouillon' && (
                        <button onClick={() => finaliserDemande(demande.idDemande)} className="px-2 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition">
                          Soumettre
                        </button>
                      )}
                      {(demande.statut === 'Brouillon' || demande.statut === 'En attente' || demande.statut === 'Rejete') && (
                        <button onClick={() => handleDeleteDemande(demande.idDemande)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>


      {/* Modal Visualisation */}
      {viewingDemande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Détails de la commande #{viewingDemande.idDemande}</h3>
                <p className="text-sm text-gray-500">Service: {viewingDemande.nomService} | Budget: {viewingDemande.numeroBudget}</p>
              </div>
              <button onClick={() => setViewingDemande(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Désignation</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantité</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">P.U Estimé (FBU)</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Spécifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewingDemande.articles.map((art, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium">{art.nomArticle}</td>
                      <td className="px-4 py-3 text-sm">{art.quantite}</td>
                      <td className="px-4 py-3 text-sm font-bold text-primary">{art.montant ? art.montant.toLocaleString() + ' FBU' : '—'}</td>
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
          <div className="bg-surface rounded-3xl p-0 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface/10 rounded-xl">
                  <History className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">Historique Complet</h3>
                  <p className="text-blue-200 text-xs font-bold opacity-80 uppercase tracking-tighter">Audit Trail & Timeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-2 hover:bg-surface/10 rounded-full transition-colors"
              >
                <XCircle className="h-7 w-7" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-gray-500 font-bold animate-pulse uppercase text-xs tracking-widest">Récupération des données...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aucun historique disponible pour cette demande.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8">
                  {historyData.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Point sur la ligne */}
                      <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all duration-300 group-hover:scale-125 ${
                        item.action.includes('Validation') || item.nouveauStatut === 'Valide' ? 'bg-emerald-500 shadow-emerald-200' :
                        item.nouveauStatut === 'Inclus dans Marché' ? 'bg-indigo-500 shadow-indigo-200' :
                        item.action.includes('Rejet') || item.nouveauStatut === 'Rejete' ? 'bg-red-500 shadow-red-200' :
                        'bg-blue-500 shadow-blue-200'
                      }`} />
                      
                      <div className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.action}</h4>
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border border-gray-200">
                            {new Date(item.dateAction).toLocaleString('fr-FR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-700">{item.nomUtilisateur}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.roleUtilisateur}</p>
                          </div>
                        </div>

                        {item.nouveauStatut && (
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Nouveau Statut :</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatutBadge(item.nouveauStatut)}`}>
                              {item.nouveauStatut}
                            </span>
                          </div>
                        )}

                        {item.motif && (
                          <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl italic text-xs text-amber-800 relative">
                            <MessageSquare className="h-3 w-3 absolute -top-1.5 -left-1.5 bg-amber-100 rounded-full p-0.5 text-amber-600 border border-amber-200" />
                            &ldquo;{item.motif}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-surface border-t border-gray-100 text-right shrink-0">
              <button 
                onClick={() => setShowHistory(false)} 
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                Fermer l&apos;Historique
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandeurDemandes;

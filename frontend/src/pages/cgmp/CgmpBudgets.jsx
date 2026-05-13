import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  CreditCard, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  LayoutGrid, 
  Calendar,
  ArrowLeft,
  Power,
  Edit,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CgmpBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({
    numeroBudget: '',
    typeBudget: 'fourniture',
    exerciceBudgetaire: new Date().getFullYear(),
    montantEstime: '',
    sourceFinancier: 'Etat'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les budgets.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Ouvert' ? 'Ferme' : 'Ouvert';
    try {
      await api.patch(`/budgets/${id}/status`, { status: nextStatus });
      loadBudgets();
    } catch (err) {
      console.error(err);
      setError('Erreur lors du changement de statut.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadBudgets();
      setLoading(false);
    };
    init();
  }, []);

  // Génération automatique du numéro de budget
  useEffect(() => {
    if (showForm) {
      const fetchNextNumber = async () => {
        try {
          const res = await api.get(`/budgets/next-number/${form.exerciceBudgetaire}/${form.typeBudget}`);
          setForm(prev => ({ ...prev, numeroBudget: res.data.nextNumber }));
        } catch (err) {
          console.error('Erreur lors de la génération du numéro:', err);
        }
      };
      fetchNextNumber();
    }
  }, [form.typeBudget, form.exerciceBudgetaire, showForm]);

  const resetForm = () => {
    setForm({ numeroBudget: '', typeBudget: 'fourniture', exerciceBudgetaire: new Date().getFullYear(), montantEstime: '', sourceFinancier: 'Etat' });
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isEditing) {
        await api.put(`/budgets/${editId}`, form);
        setMessage('Ligne budgétaire mise à jour avec succès.');
      } else {
        await api.post('/budgets', form);
        setMessage('Nouvelle ligne budgétaire créée avec succès.');
      }
      resetForm();
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const handleEdit = (budget) => {
    setError('');
    setMessage('');
    setForm({
      numeroBudget: budget.numeroBudget,
      typeBudget: budget.typeBudget,
      exerciceBudgetaire: budget.exerciceBudgetaire,
      montantEstime: budget.montantEstime,
      sourceFinancier: budget.sourceFinancier || 'Etat'
    });
    setEditId(budget.idBudget);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne budgétaire ?")) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/budgets/${id}`);
      setMessage('Ligne budgétaire supprimée avec succès.');
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const filteredBudgets = budgets.filter(b => 
    b.numeroBudget?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    const colors = {
      'fourniture': 'bg-blue-100 text-blue-800',
      'travaux': 'bg-amber-100 text-amber-800',
      'service': 'bg-emerald-100 text-emerald-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Chargement...</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="text-primary h-8 w-8" />
            Gestion des Enveloppes Budgétaires
          </h1>
          <p className="text-gray-500 mt-2">Configurez les enveloppes budgétaires annuelles par catégorie avant l&apos;ouverture des demandes.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/cgmp" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all font-medium shadow-sm">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="px-6 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            {showForm ? 'Annuler' : isEditing ? 'Modifier la Ligne' : 'Créer une Ligne'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {showForm && (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4">
          <div className="bg-primary px-8 py-5 text-white flex items-center gap-3">
            <PlusCircle className="h-6 w-6" />
            <h2 className="text-xl font-bold">{isEditing ? 'Modifier la Ligne Budgétaire' : 'Nouveau Numéro Budgétaire'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Référence Budgétaire</label>
              <input
                type="text"
                required
                readOnly
                placeholder="Génération automatique..."
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl outline-none transition-all font-bold text-primary cursor-not-allowed"
                value={form.numeroBudget}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Type de Marché</label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                value={form.typeBudget}
                onChange={(e) => setForm({...form, typeBudget: e.target.value})}
              >
                <option value="fourniture">Fourniture</option>
                <option value="travaux">Travaux</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Année d&apos;Exercice</label>
              <input
                type="number"
                required
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl outline-none transition-all font-bold cursor-not-allowed"
                value={form.exerciceBudgetaire}
              />
            </div>
            {/* <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Source</label>
              <select
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20"
                value={form.sourceFinancier}
                onChange={(e) => setForm({...form, sourceFinancier: e.target.value})}
              >
                <option value="Etat">Budget de l&apos;État</option>
                <option value="Propre">Fonds Propres</option>
                <option value="Don">Don / Prêt</option>
              </select>
            </div> */}
            
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button type="button" onClick={resetForm} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">
                Annuler
              </button>
              <button type="submit" className="px-10 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20">
                {isEditing ? 'Mettre à jour' : 'Créer la Ligne'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un budget..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed">
            Aucun budget trouvé.
          </div>
        ) : (
          filteredBudgets.map(b => (
            <div key={b.idBudget} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${b.statusValidation === 'Ouvert' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {b.statusValidation === 'Ouvert' ? 'ACTIF' : 'INACTIF'}
                  </span>
                  <button 
                    onClick={() => toggleStatus(b.idBudget, b.statusValidation)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm ${
                      b.statusValidation === 'Ouvert' 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    {b.statusValidation === 'Ouvert' ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{b.numeroBudget}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                     <Edit className="h-4 w-4" />
                   </button>
                   <button onClick={() => handleDelete(b.idBudget)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>
              <div className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase mb-4 ${getTypeColor(b.typeBudget)}`}>
                {b.typeBudget}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-2 pb-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Exercice {b.exerciceBudgetaire}
                </div>
              </div>
              <div className="text-sm font-bold text-gray-700">
                Origine: {b.sourceFinancier || '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CgmpBudgets;

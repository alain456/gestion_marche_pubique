import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Search, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  ArrowRight,
  Server,
  Monitor,
  Cpu,
  Laptop
} from 'lucide-react';

const TYPES = [
  { key: 'tous', label: 'Tous', icon: Laptop, color: 'gray', bgLight: 'bg-gray-50', textColor: 'text-primary', borderColor: 'border-primary/30', bgActive: 'bg-primary' },
  { key: 'fourniture', label: 'Fourniture', icon: Monitor, color: 'blue', bgLight: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200', bgActive: 'bg-blue-600' },
  { key: 'travaux', label: 'Travaux', icon: Server, color: 'amber', bgLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200', bgActive: 'bg-amber-600' },
  { key: 'service', label: 'Service', icon: Cpu, color: 'emerald', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200', bgActive: 'bg-emerald-600' },
];

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tous');
  const [form, setForm] = useState({ idArticle: null, nomArticle: '', typeArticle: 'fourniture' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les articles.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadArticles();
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setForm({ idArticle: null, nomArticle: '', typeArticle: activeTab });
    setMessage('');
    setError('');
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
    setForm(prev => ({ ...prev, typeArticle: type }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.nomArticle.trim()) {
      setError("Le nom de l'article est requis.");
      return;
    }

    try {
      if (form.idArticle) {
        await api.put(`/articles/${form.idArticle}`, {
          nomArticle: form.nomArticle,
          typeArticle: form.typeArticle,
        });
        setMessage('Article mis à jour avec succès.');
      } else {
        await api.post('/articles', { nomArticle: form.nomArticle, typeArticle: form.typeArticle });
        setMessage('Article créé avec succès.');
      }

      resetForm();
      loadArticles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const handleEdit = (article) => {
    setActiveTab(article.typeArticle);
    setForm({ idArticle: article.idArticle, nomArticle: article.nomArticle, typeArticle: article.typeArticle });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (idArticle) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${idArticle}`);
      setMessage('Article supprimé avec succès.');
      loadArticles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Impossible de supprimer cet article.');
    }
  };

  const currentType = TYPES.find(t => t.key === activeTab);
  const TypeIcon = currentType.icon;

  const filteredArticles = articles.filter(article => {
    const matchesType = activeTab === 'tous' || article.typeArticle === activeTab;
    const matchesSearch = article.nomArticle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const countByType = (type) => type === 'tous' ? articles.length : articles.filter(a => a.typeArticle === type).length;

  const getTypeInfo = (typeKey) => TYPES.find(t => t.key === typeKey);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Chargement des articles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />
            Gestion des Articles
          </h1>
          <p className="text-gray-500 mt-1">Classifiez les articles par type : Fourniture, Travaux ou Service.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition border border-gray-200 shadow-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Tableau de bord
        </Link>
      </div>

      {/* Onglets de Type */}
      <div className="grid grid-cols-4 gap-4">
        {TYPES.map(type => {
          const Icon = type.icon;
          const count = countByType(type.key);
          const isActive = activeTab === type.key;
          return (
            <button
              key={type.key}
              onClick={() => handleTabChange(type.key)}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                isActive 
                  ? `${type.borderColor} ${type.bgLight} shadow-lg` 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-xl ${isActive ? type.bgLight : 'bg-gray-50'} transition-colors`}>
                  <Icon className={`h-6 w-6 ${isActive ? type.textColor : 'text-gray-400'} transition-colors`} />
                </div>
                <span className={`text-2xl font-bold ${isActive ? type.textColor : 'text-gray-300'} transition-colors`}>
                  {count}
                </span>
              </div>
              <h3 className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'} transition-colors`}>
                {type.label}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
                {count === 0 ? 'Aucun article' : count === 1 ? '1 article' : `${count} articles`}
              </p>
              {isActive && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 ${type.bgActive} rounded-t-full`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        
        {/* Left Column: Articles List */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher dans ${currentType.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <section className={`bg-white rounded-3xl border-2 ${currentType.borderColor} shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${currentType.bgLight} flex items-center justify-between`}>
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <TypeIcon className={`h-5 w-5 ${currentType.textColor}`} />
                Articles — {currentType.label}
                <span className={`${currentType.bgLight} ${currentType.textColor} text-xs px-2 py-0.5 rounded-full font-bold border ${currentType.borderColor}`}>
                  {filteredArticles.length}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Identifiant / Nom de l&apos;Article</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <TypeIcon className="h-10 w-10 mb-2 opacity-20" />
                          <p>Aucun article de type <strong>{currentType.label}</strong> trouvé</p>
                          <p className="text-xs mt-1">Utilisez le formulaire à droite pour en créer un.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((a) => (
                      <tr key={a.idArticle} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const typeInfo = getTypeInfo(a.typeArticle) || currentType;
                            const ItemIcon = typeInfo.icon;
                            return (
                              <div className="flex items-center">
                                <div className={`h-9 w-9 rounded-lg ${typeInfo.bgLight} flex items-center justify-center ${typeInfo.textColor} font-bold mr-3`}>
                                  <ItemIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{a.nomArticle}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-gray-400 font-mono uppercase">ID: {a.idArticle}</span>
                                    {activeTab === 'tous' && (
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${typeInfo.bgLight} ${typeInfo.textColor}`}>
                                        {a.typeArticle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a.idArticle)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Add/Edit Form */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              {form.idArticle ? (
                <>
                  <Edit className="h-5 w-5 text-primary" />
                  Modifier l&apos;Article
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Nouvel Article
                </>
              )}
            </h2>

            {message && (
              <div className="mb-6 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-6 flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Type d&apos;article</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = form.typeArticle === type.key;
                    return (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, typeArticle: type.key }));
                          setActiveTab(type.key);
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          isSelected 
                            ? `${type.borderColor} ${type.bgLight} ${type.textColor}` 
                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? type.textColor : 'text-gray-300'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nom de l&apos;article</label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder={
                      form.typeArticle === 'fourniture' ? 'Ex: Papier A4, Encre imprimante' :
                      form.typeArticle === 'travaux' ? 'Ex: Construction bâtiment, Réfection route' :
                      'Ex: Consultation IT, Formation personnel'
                    }
                    value={form.nomArticle}
                    onChange={(e) => setForm((prev) => ({ ...prev, nomArticle: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1">
                  <ArrowRight className="h-2 w-2" />
                  L&apos;article sera classé dans la catégorie <strong className={currentType.textColor}>{currentType.label}</strong>.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-md shadow-primary/20 active:scale-95"
                >
                  {form.idArticle ? 'Mettre à jour' : 'Créer l\'article'}
                </button>
                {form.idArticle && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

      </div>
    </div>
  );
};

export default AdminArticles;

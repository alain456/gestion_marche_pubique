import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Settings, 
  Trash2, 
  Edit, 
  Search, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldPlus,
  ArrowRight
} from 'lucide-react';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ idRole: null, nomRole: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les rôles.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadRoles();
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setForm({ idRole: null, nomRole: '' });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.nomRole.trim()) {
      setError('Le nom du rôle est requis.');
      return;
    }

    try {
      if (form.idRole) {
        await api.put('/users/roles', {
          idRole: form.idRole,
          nomRole: form.nomRole,
        });
        setMessage('Rôle mis à jour avec succès.');
      } else {
        await api.post('/users/roles', { nomRole: form.nomRole });
        setMessage('Rôle créé avec succès.');
      }

      resetForm();
      loadRoles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const handleEdit = (role) => {
    setForm({ idRole: role.idRole, nomRole: role.nomRole });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (idRole) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Certains utilisateurs pourraient y être liés.')) return;
    try {
      await api.delete(`/users/roles/${idRole}`);
      setMessage('Rôle supprimé avec succès.');
      loadRoles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Impossible de supprimer ce rôle. Vérifiez s\'il est utilisé.');
    }
  };

  const filteredRoles = roles.filter(role => 
    role.nomRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Chargement des rôles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Gestion des Rôles
          </h1>
          <p className="text-gray-500 mt-1">Définissez les niveaux d&apos;accès pour les différents acteurs du système.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition border border-gray-200 shadow-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Tableau de bord
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        
        {/* Left Column: Roles List */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un rôle par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                Liste des Rôles Système
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {filteredRoles.length}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Identifiant / Nom du Rôle</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <Search className="h-10 w-10 mb-2 opacity-20" />
                          <p>Aucun rôle trouvé</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((r) => (
                      <tr key={r.idRole} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 capitalize">{r.nomRole.replace(/_/g, ' ')}</div>
                              <div className="text-[10px] text-gray-400 font-mono uppercase">ID: {r.idRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.idRole)}
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
              {form.idRole ? (
                <>
                  <Edit className="h-5 w-5 text-primary" />
                  Modifier le Rôle
                </>
              ) : (
                <>
                  <ShieldPlus className="h-5 w-5 text-primary" />
                  Nouveau Rôle
                </>
              )}
            </h2>

            {message && (
              <div className="mb-6 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-6 flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nom du rôle</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Nom du rôle"
                    value={form.nomRole}
                    onChange={(e) => setForm((prev) => ({ ...prev, nomRole: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1">
                  <ArrowRight className="h-2 w-2" />
                  Utilisez des minuscules et des underscores (ex: role_nom)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-md shadow-primary/20 active:scale-95"
                >
                  {form.idRole ? 'Mettre à jour' : 'Créer le rôle'}
                </button>
                {form.idRole && (
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

export default AdminRoles;


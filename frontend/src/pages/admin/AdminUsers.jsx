import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Edit, 
  Search, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ idUser: null, nom: '', email: '', password: '', idRole: '', idService: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les utilisateurs.');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les rôles.');
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadRoles(), loadServices()]);
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setForm({ idUser: null, nom: '', email: '', password: '', idRole: '', idService: '' });
    setError('');
    setMessage('');
  };

  const requiresService = (roleId) => {
    const role = roles.find(r => r.idRole === parseInt(roleId));
    if (!role) return false;
    const name = role.nomRole.toLowerCase();
    // Les rôles qui nécessitent obligatoirement un service
    // Exclure 'chef institution' qui est un rôle global
    if (name.includes('institution')) return false;
    
    return name.includes('chef') || name.includes('demandeur');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.nom || !form.email || (!form.idUser && !form.password) || !form.idRole) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (requiresService(form.idRole) && !form.idService) {
      setError('Ce rôle nécessite obligatoirement la sélection d\'un service.');
      return;
    }

    try {
      const payload = {
        idUser: form.idUser,
        nom: form.nom,
        email: form.email,
        password: form.password || undefined,
        idRole: form.idRole,
        idService: form.idService || null,
      };

      if (form.idUser) {
        await api.put('/users', payload);
        setMessage('Utilisateur mis à jour avec succès.');
      } else {
        await api.post('/users', payload);
        setMessage('Utilisateur créé avec succès.');
      }

      resetForm();
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const handleEdit = (user) => {
    const selectedRole = roles.find((role) => role.nomRole === user.nomRole);
    setForm({
      idUser: user.idUser,
      nom: user.nom,
      email: user.email,
      password: '',
      idRole: selectedRole?.idRole || '',
      idService: user.idService || '',
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (idUser) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/users/${idUser}`);
      setMessage('Utilisateur supprimé avec succès.');
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Impossible de supprimer cet utilisateur.');
    }
  };

  const handleToggleStatus = async (idUser) => {
    try {
      await api.patch(`/users/${idUser}/toggle-status`);
      setMessage('Statut mis à jour.');
      loadUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du changement de statut.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nomRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nomService?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 mt-1">Administrez les comptes et les accès au système.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-gray-700 rounded-xl hover:bg-gray-50 transition border border-gray-200 shadow-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Tableau de bord
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        
        {/* Left Column: Users List */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, rôle ou service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <section className="bg-surface rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                Liste des Utilisateurs
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {filteredUsers.length}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-surface">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle / Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <Search className="h-10 w-10 mb-2 opacity-20" />
                          <p>Aucun utilisateur trouvé</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.idUser} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                              {u.nom.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{u.nom}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold w-fit">
                              <Shield className="h-3 w-3" />
                              {u.nomRole}
                            </span>
                            {u.nomService && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium w-fit">
                                <Building className="h-3 w-3" />
                                {u.nomService}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleToggleStatus(u.idUser)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              u.est_actif 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {u.est_actif ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {u.est_actif ? 'ACTIF' : 'INACTIF'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.idUser)}
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
          <section className="bg-surface rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              {form.idUser ? (
                <>
                  <Edit className="h-5 w-5 text-primary" />
                  Modifier le profil
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 text-primary" />
                  Nouvel Utilisateur
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

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              {/* Fake fields to prevent browser autofill */}
              <input type="text" name="fake_email_prevent_autofill" style={{ display: 'none' }} />
              <input type="password" name="fake_password_prevent_autofill" style={{ display: 'none' }} />

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nom complet</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Jean Dupont"
                    value={form.nom}
                    onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="jean.dupont@setic.gov.bi"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    autoComplete="one-time-code"
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    readOnly
                    name="user_email_no_fill"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Mot de passe {form.idUser && <span className="text-[10px] font-normal text-gray-400 normal-case">(Laisser vide pour ne pas changer)</span>}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={form.idUser ? "••••••••" : "Mot de passe sécurisé"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    autoComplete="one-time-code"
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    readOnly
                    name="user_password_new"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Rôle</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={form.idRole}
                      onChange={(e) => setForm((prev) => ({ ...prev, idRole: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none"
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map((role) => (
                        <option key={role.idRole} value={role.idRole}>
                          {role.nomRole}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    Service {requiresService(form.idRole) && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={form.idService}
                      onChange={(e) => setForm((prev) => ({ ...prev, idService: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none ${
                        requiresService(form.idRole) ? 'bg-surface border-primary/20' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <option value="">{requiresService(form.idRole) ? 'Sélectionner un service' : 'Aucun service'}</option>
                      {services.map((service) => (
                        <option key={service.idService} value={service.idService}>
                          {service.nomService}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-md shadow-primary/20 active:scale-95"
                >
                  {form.idUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                {form.idUser && (
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

export default AdminUsers;



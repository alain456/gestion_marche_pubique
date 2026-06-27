import { useState, useEffect } from 'react';
import api from '../../services/api';
import { notifyPermissionsUpdated } from '../../utils/permissionsSync';
import { Link } from 'react-router-dom';
import {
  UserCog,
  ArrowLeft,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Save,
  Building,
  ChevronRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const PERM_CATEGORIES = {
  'Utilisateurs & Rôles': ['GERER_UTILISATEURS', 'VOIR_UTILISATEURS', 'GERER_ROLES_PERMISSIONS', 'GERER_SERVICES', 'GERER_ARTICLES'],
  'Demandes': [
    'CREER_DEMANDE', 'VOIR_MES_DEMANDES', 'VOIR_TOUTES_DEMANDES', 'MODIFIER_DEMANDE', 'SUPPRIMER_DEMANDE',
    'DEMANDE_CREATE', 'DEMANDE_READ_OWN', 'DEMANDE_READ_ALL', 'DEMANDE_UPDATE', 'DEMANDE_DELETE'
  ],
  'Budget & Validation': ['GERER_BUDGETS', 'VOIR_BUDGETS', 'VALIDER_BUDGET_DEMANDE', 'VOIR_STATISTIQUES'],
  'Marchés & Contrats': ['VOIR_MARCHES', 'GERER_MARCHES', 'AJUSTER_DEMANDE_CGMP', 'GERER_SOUMISSIONS', 'CREER_CONTRAT', 'VALIDER_CONTRAT', 'GERER_PARAMETRES_SEUILS'],
  'Réception & Paiements': ['ENREGISTRER_EXECUTION', 'VALIDER_RECEPTION', 'VOIR_RECEPTIONS', 'EFFECTUER_PAIEMENT', 'VOIR_PAIEMENTS'],
};

const getCategory = (code) => {
  for (const [cat, codes] of Object.entries(PERM_CATEGORIES)) {
    if (codes.includes(code)) return cat;
  }
  return 'Autres';
};

const AdminUserPermissions = () => {
  const [users, setUsers] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rolePermissionIds, setRolePermissionIds] = useState([]);
  const [userPermissionIds, setUserPermissionIds] = useState([]);
  const [revokedPermissionIds, setRevokedPermissionIds] = useState([]);
  const [effectivePermissionIds, setEffectivePermissionIds] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [usersRes, permsRes] = await Promise.all([
        api.get('/users'),
        api.get('/permissions')
      ]);
      setUsers(usersRes.data || []);
      setAllPermissions(permsRes.data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setLoadError(
        err.response?.status === 403
          ? 'Session expirée ou droits insuffisants. Veuillez vous déconnecter et vous reconnecter.'
          : 'Impossible de charger les données. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const applyPermissionDetail = (detail) => {
    setSelectedUser(detail.user || selectedUser);
    setRolePermissionIds(detail.rolePermissionIds || []);
    setUserPermissionIds(detail.userPermissionIds || []);
    setRevokedPermissionIds(detail.revokedPermissionIds || []);
    setEffectivePermissionIds(detail.effectivePermissionIds || []);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessage('');
    setError('');
    setLoadingPerms(true);
    setRolePermissionIds([]);
    setUserPermissionIds([]);
    setRevokedPermissionIds([]);
    setEffectivePermissionIds([]);
    try {
      const res = await api.get(`/permissions/user/${user.idUser}/detail`);
      applyPermissionDetail(res.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les permissions de cet utilisateur.');
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleTogglePermission = (idPermission) => {
    setEffectivePermissionIds(prev =>
      prev.includes(idPermission)
        ? prev.filter(id => id !== idPermission)
        : [...prev, idPermission]
    );
  };

  const handleSelectAll = () => {
    const allIds = allPermissions.map(p => p.idPermission);
    const allSelected = allIds.every(id => effectivePermissionIds.includes(id));
    setEffectivePermissionIds(allSelected ? [] : allIds);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/permissions/user/${selectedUser.idUser}`, {
        effectivePermissionIds
      });
      applyPermissionDetail(res.data);
      notifyPermissionsUpdated(selectedUser.idUser);
      setMessage(`Permissions de "${selectedUser.nom}" mises à jour. L'utilisateur verra les changements automatiquement.`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nomRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = allPermissions.reduce((acc, perm) => {
    const cat = getCategory(perm.codePermission);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  const selectedExtraCount = effectivePermissionIds.filter(id => !rolePermissionIds.includes(id)).length;
  const revokedBaseCount = rolePermissionIds.filter(id => !effectivePermissionIds.includes(id)).length;
  const previewEffectiveCount = new Set(effectivePermissionIds).size;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Chargement des données...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-red-600 font-semibold">{loadError}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="h-7 w-7 text-primary" />
            Attribution des permissions
          </h1>
          <p className="text-gray-500 mt-1">
            En tant qu&apos;administrateur, vous pouvez accorder ou retirer n&apos;importe quelle permission,
            y compris celles qui viennent du rôle de base.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-gray-700 rounded-xl hover:bg-gray-50 transition border border-gray-200 shadow-sm font-medium shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Dashboard
        </Link>
      </div>

      {message && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl text-sm">
          <XCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {allPermissions.length === 0 && !loading && (
        <div className="flex items-center gap-3 text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <strong>La liste des permissions est vide.</strong> Redémarrez le serveur backend pour synchroniser les permissions, puis reconnectez-vous.
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>

          <div className="bg-surface rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                Utilisateurs
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {filteredUsers.length}
                </span>
              </h2>
            </div>
            <ul className="divide-y divide-gray-100 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <li className="py-10 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</li>
              ) : (
                filteredUsers.map(u => (
                  <li key={u.idUser}>
                    <button
                      onClick={() => handleSelectUser(u)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-primary/5 ${
                        selectedUser?.idUser === u.idUser
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                        {u.nom.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{u.nom}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Shield className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="text-[11px] text-blue-600 font-medium">{u.nomRole}</span>
                          {u.nomService && (
                            <>
                              <Building className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="text-[11px] text-gray-400 truncate">{u.nomService}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${
                        selectedUser?.idUser === u.idUser ? 'text-primary' : 'text-gray-300'
                      }`} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div>
          {!selectedUser ? (
            <div className="bg-surface rounded-3xl border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-gray-400 py-24 gap-3">
              <UserCog className="h-16 w-16 opacity-20" />
              <div className="text-center">
                <p className="font-semibold text-gray-500">Aucun utilisateur sélectionné</p>
                <p className="text-sm mt-1">Choisissez un utilisateur pour lui attribuer des permissions</p>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between flex-wrap gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedUser.nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedUser.nom}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                        <Shield className="h-3 w-3" />
                        {selectedUser.nomRole}
                      </span>
                      <span className="text-xs text-gray-400">{selectedUser.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                    {rolePermissionIds.length} via rôle
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium">
                    +{selectedExtraCount} individuelle(s)
                  </span>
                  <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-medium">
                    -{revokedBaseCount} retirée(s)
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-medium">
                    {previewEffectiveCount} effectives
                  </span>
                </div>
              </div>

              <div className="px-6 py-3 border-b border-gray-100 bg-amber-50/60 text-xs text-amber-800">
                Les permissions marquées <strong>Rôle</strong> viennent du rôle « {selectedUser.nomRole} ».
                Vous pouvez aussi les décocher pour les retirer à cet utilisateur précis.
              </div>

              <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={allPermissions.length === 0}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-40"
                >
                  {effectivePermissionIds.length === allPermissions.length
                    ? 'Tout décocher'
                    : 'Tout cocher'}
                </button>
                <span className="text-xs text-gray-500">
                  {effectivePermissionIds.length} / {allPermissions.length} permissions actives
                </span>
              </div>

              <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                {loadingPerms ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-400">Chargement des permissions...</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([catName, perms]) => (
                    <div key={catName}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="h-px flex-1 bg-gray-100"></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap px-2">{catName}</span>
                        <span className="h-px flex-1 bg-gray-100"></span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {perms.map(perm => {
                          const fromRole = rolePermissionIds.includes(perm.idPermission);
                          const fromUser = userPermissionIds.includes(perm.idPermission);
                          const revokedFromRole = revokedPermissionIds.includes(perm.idPermission);
                          const isEffective = effectivePermissionIds.includes(perm.idPermission);

                          return (
                            <div
                              key={perm.idPermission}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                fromRole && !isEffective
                                  ? 'bg-red-50/60 border-red-200'
                                  : fromRole
                                    ? 'bg-blue-50/60 border-blue-100'
                                    : fromUser
                                    ? 'bg-emerald-50/60 border-emerald-200'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer mt-0.5 shrink-0"
                                checked={isEffective}
                                onChange={() => handleTogglePermission(perm.idPermission)}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className={`text-[11px] font-bold font-mono leading-tight ${
                                    isEffective ? 'text-gray-800' : 'text-gray-700'
                                  }`}>
                                    {perm.codePermission}
                                  </div>
                                  {fromRole && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                      Rôle
                                    </span>
                                  )}
                                  {fromRole && revokedFromRole && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                      Retirée
                                    </span>
                                  )}
                                  {!fromRole && fromUser && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                      Individuelle
                                    </span>
                                  )}
                                </div>
                                {perm.description && (
                                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{perm.description}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Les menus de l&apos;utilisateur se mettent à jour automatiquement (quelques secondes max).
                  Pour modifier les droits de base du rôle, utilisez <Link to="/admin/roles" className="text-primary font-semibold hover:underline">Rôles &amp; Permissions</Link>.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving || allPermissions.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-md shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPermissions;

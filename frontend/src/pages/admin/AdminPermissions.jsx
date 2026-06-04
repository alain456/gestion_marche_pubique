import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, Edit, Plus, Shield, Trash2, XCircle } from 'lucide-react';

const emptyForm = { idPermission: null, codePermission: '', description: '' };

const AdminPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPermissions = async () => {
    try {
      const res = await api.get('/permissions');
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (form.idPermission) {
        await api.put(`/permissions/${form.idPermission}`, {
          codePermission: form.codePermission,
          description: form.description
        });
        setMessage('Permission mise à jour.');
      } else {
        await api.post('/permissions', {
          codePermission: form.codePermission,
          description: form.description
        });
        setMessage('Permission créée.');
      }
      resetForm();
      loadPermissions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l’enregistrement.');
    }
  };

  const handleDelete = async (idPermission) => {
    if (!window.confirm('Supprimer cette permission ?')) return;
    try {
      await api.delete(`/permissions/${idPermission}`);
      setMessage('Permission supprimée.');
      loadPermissions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement des permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            CRUD Permissions
          </h1>
          <p className="text-gray-500">Créer, modifier et supprimer les permissions du système.</p>
        </div>
        <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" />{message}</div>}
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" />{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissions.map((p) => (
                <tr key={p.idPermission}>
                  <td className="px-4 py-3 text-sm font-semibold">{p.codePermission}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setForm({ idPermission: p.idPermission, codePermission: p.codePermission, description: p.description || '' })}
                      className="p-2 hover:bg-blue-50 rounded-lg mr-2"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.idPermission)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold mb-4">{form.idPermission ? 'Modifier permission' : 'Nouvelle permission'}</h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              value={form.codePermission}
              onChange={(e) => setForm((prev) => ({ ...prev, codePermission: e.target.value }))}
              placeholder="CODE_PERMISSION"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              required
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="w-full border rounded-xl px-3 py-2 text-sm min-h-[90px]"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                {form.idPermission ? 'Mettre à jour' : 'Créer'}
              </button>
              {form.idPermission && (
                <button type="button" onClick={resetForm} className="px-4 border rounded-xl text-sm">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPermissions;

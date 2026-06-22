import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Save,
  LayoutGrid,
  Settings
} from 'lucide-react';

const AdminSeuils = () => {
  const [seuilRules, setSeuilRules] = useState([]);
  const [parametres, setParametres] = useState([]);
  const [showParamModal, setShowParamModal] = useState(false);
  const [newParam, setNewParam] = useState({ typeParam: 'TYPE_INSTITUTION', valeur: '' });
  const [paramLoading, setParamLoading] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSeuils = async () => {
    try {
      const res = await api.get('/seuils');
      setSeuilRules(res.data.map(r => ({
        id: r.idSeuil,
        typeInstitution: r.typeInstitution || 'Administrations Publiques',
        typeMarche: r.typeMarche,
        min: r.montantMin,
        max: r.montantMax,
        modePassation: r.modePassation,
        label: r.label
      })));
    } catch (err) {
      console.error('Erreur chargement seuils:', err);
      setError('Impossible de charger les seuils.');
    }
  };

  const fetchParametres = async () => {
    try {
      const res = await api.get('/parametres');
      setParametres(res.data);
    } catch (err) {
      console.error('Erreur chargement parametres:', err);
      setError('Impossible de charger les paramètres dynamiques.');
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchSeuils(), fetchParametres()]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleAddParam = async (e) => {
    e.preventDefault();
    if (!newParam.valeur.trim()) return;
    setParamLoading(true);
    try {
      await api.post('/parametres', newParam);
      setNewParam({ ...newParam, valeur: '' });
      fetchParametres();
      setMessage('Paramètre ajouté avec succès.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du paramètre.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setParamLoading(false);
    }
  };

  const handleDeleteParam = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      try {
        await api.delete(`/parametres/${id}`);
        fetchParametres();
        setMessage('Paramètre supprimé.');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la suppression du paramètre.');
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  const handleSeuilChange = (id, field, value) => {
    setSeuilRules((prev) => prev.map((rule) => {
      if (rule.id !== id) return rule;
      if (field === 'min' || field === 'max') {
        return { ...rule, [field]: value === '' ? null : Number(value) };
      }
      return { ...rule, [field]: value };
    }));
  };

  const saveSeuilRule = async (rule) => {
    try {
      await api.put(`/seuils/${rule.id}`, {
        typeInstitution: rule.typeInstitution,
        typeMarche: rule.typeMarche,
        montantMin: rule.min,
        montantMax: rule.max,
        modePassation: rule.modePassation,
        label: rule.label
      });
      setMessage('Seuil enregistré avec succès.');
      setTimeout(() => setMessage(''), 3000);
      fetchSeuils();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde du seuil.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const addSeuilRule = async () => {
    try {
      const defaultInst = parametres.find(p => p.typeParam === 'TYPE_INSTITUTION')?.valeur || '';
      const defaultMarche = parametres.find(p => p.typeParam === 'TYPE_MARCHE')?.valeur || '';
      const defaultPassation = parametres.find(p => p.typeParam === 'MODE_PASSATION')?.valeur || '';

      await api.post('/seuils', {
        typeInstitution: defaultInst, 
        typeMarche: defaultMarche, 
        montantMin: 0, 
        montantMax: null, 
        modePassation: defaultPassation, 
        label: 'Nouvelle règle'
      });
      fetchSeuils();
      setMessage('Nouvelle règle ajoutée.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'ajout de la règle.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const removeSeuilRule = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette règle de seuil ?')) {
      try {
        await api.delete(`/seuils/${id}`);
        fetchSeuils();
        setMessage('Règle supprimée avec succès.');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la suppression de la règle.');
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Chargement des configurations...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-primary h-8 w-8" />
            Paramétrage des Seuils de Passation
          </h1>
          <p className="text-gray-500 mt-2">Gérez les règles de seuils et les paramètres dynamiques utilisés par le système.</p>
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

      {/* Configuration CGMP des règles de passation */}
      <section className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Règles de seuils</h3>
            <p className="text-sm text-gray-500">Définissez les modes de passation par type de marché, d'institution et intervalle de montant.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowParamModal(true)}
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center gap-2"
          >
            <LayoutGrid size={16} /> Gérer les paramètres globaux (Dictionnaires)
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs text-gray-600 mb-2">
            Le système applique automatiquement la première règle qui correspond au type de marché, au type d'institution et au montant estimé.
          </p>
          {seuilRules.map((rule) => (
            <div key={rule.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
              <select
                value={rule.typeInstitution || ''}
                onChange={(e) => handleSeuilChange(rule.id, 'typeInstitution', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              >
                <option value="">-- Institution --</option>
                {parametres.filter(p => p.typeParam === 'TYPE_INSTITUTION').map(p => (
                  <option key={p.idParam} value={p.valeur}>{p.valeur}</option>
                ))}
              </select>
              <select
                value={rule.typeMarche}
                onChange={(e) => handleSeuilChange(rule.id, 'typeMarche', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              >
                <option value="">-- Type de marché --</option>
                {parametres.filter(p => p.typeParam === 'TYPE_MARCHE').map(p => (
                  <option key={p.idParam} value={p.valeur}>{p.valeur}</option>
                ))}
              </select>
              <input
                type="number"
                value={rule.min ?? ''}
                onChange={(e) => handleSeuilChange(rule.id, 'min', e.target.value)}
                placeholder="Montant min"
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
              <input
                type="number"
                value={rule.max ?? ''}
                onChange={(e) => handleSeuilChange(rule.id, 'max', e.target.value)}
                placeholder="Montant max (vide = infini)"
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
              <select
                value={rule.modePassation}
                onChange={(e) => handleSeuilChange(rule.id, 'modePassation', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              >
                <option value="">-- Mode passation --</option>
                {parametres.filter(p => p.typeParam === 'MODE_PASSATION').map(p => (
                  <option key={p.idParam} value={p.valeur}>{p.valeur}</option>
                ))}
              </select>
              <input
                type="text"
                value={rule.label}
                onChange={(e) => handleSeuilChange(rule.id, 'label', e.target.value)}
                placeholder="Libellé seuil"
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => saveSeuilRule(rule)}
                  className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 flex-1"
                  title="Enregistrer les modifications"
                >
                  <Save size={16} className="mx-auto" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSeuilRule(rule.id)}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 flex-1"
                  title="Supprimer la règle"
                >
                  <XCircle size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSeuilRule}
            className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold mt-4"
          >
            + Ajouter une règle
          </button>
        </div>

        {/* Modal de gestion des paramètres */}
        {showParamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <LayoutGrid className="text-primary" />
                  Gérer les paramètres dynamiques
                </h2>
                <button onClick={() => setShowParamModal(false)} className="text-gray-400 hover:text-gray-700 transition">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex border-b">
                  {['TYPE_INSTITUTION', 'TYPE_MARCHE', 'MODE_PASSATION'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewParam({ typeParam: type, valeur: '' })}
                      className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition ${newParam.typeParam === type ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {type.replace('TYPE_', '').replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <form onSubmit={handleAddParam} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nouvelle valeur..."
                      value={newParam.valeur}
                      onChange={(e) => setNewParam({ ...newParam, valeur: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      disabled={paramLoading}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-wider hover:bg-primary/90 transition disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </form>

                  <div className="space-y-2 mt-4">
                    {parametres.filter(p => p.typeParam === newParam.typeParam).length === 0 && (
                      <p className="text-center text-gray-500 py-4 text-sm">Aucun paramètre configuré pour cette catégorie.</p>
                    )}
                    {parametres.filter(p => p.typeParam === newParam.typeParam).map((p) => (
                      <div key={p.idParam} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 transition">
                        <span className="font-semibold text-gray-700">{p.valeur}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteParam(p.idParam)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Supprimer"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSeuils;

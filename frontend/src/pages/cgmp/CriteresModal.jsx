import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CriteresModal = ({ isOpen, onClose, marketId = null, existingCriteres = null, onSaveSuccess }) => {
  const [criteres, setCriteres] = useState({ prix: 50, technique: 30, delai: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingCriteres) {
      try {
        const parsed = typeof existingCriteres === 'string' ? JSON.parse(existingCriteres) : existingCriteres;
        if (parsed && Object.keys(parsed).length > 0) {
          setCriteres({
            prix: parsed.prix || 0,
            technique: parsed.technique || 0,
            delai: parsed.delai || 0
          });
        }
      } catch (e) {
        console.error("Error parsing existing criteres", e);
      }
    }
  }, [existingCriteres, isOpen]);

  if (!isOpen) return null;

  const total = Number(criteres.prix) + Number(criteres.technique) + Number(criteres.delai);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (total !== 100) {
      setError("Le total des pondérations doit être égal à 100%.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.put(`/marches/${marketId}/criteres`, { criteres });
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l&apos;enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-lg font-bold">Critères d&apos;Évaluation (Marché #{marketId})</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Définissez le poids (%) de chaque critère. Le total doit faire 100%. Le score du prix sera calculé automatiquement en fonction de l&apos;offre la moins disante.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700">Prix Financier (%)</label>
              <input 
                type="number" min="0" max="100" 
                value={criteres.prix} 
                onChange={e => setCriteres({...criteres, prix: Number(e.target.value)})}
                className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700">Qualité Technique (%)</label>
              <input 
                type="number" min="0" max="100" 
                value={criteres.technique} 
                onChange={e => setCriteres({...criteres, technique: Number(e.target.value)})}
                className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700">Délai de Livraison (%)</label>
              <input 
                type="number" min="0" max="100" 
                value={criteres.delai} 
                onChange={e => setCriteres({...criteres, delai: Number(e.target.value)})}
                className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className={`font-black text-lg ${total === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
              Total : {total}%
            </span>
            <button 
              type="submit" disabled={loading}
              className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-800 disabled:opacity-50"
            >
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CriteresModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  marketId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  existingCriteres: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onSaveSuccess: PropTypes.func.isRequired,
};

export default CriteresModal;

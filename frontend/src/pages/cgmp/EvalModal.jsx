import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';

const EvalModal = ({ isOpen, onClose, offer = null, marketCriteres = null, onSaveSuccess }) => {
  const [notes, setNotes] = useState({ technique: 0, delai: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let maxTech = 30;
  let maxDelai = 20;
  
  if (marketCriteres) {
    try {
      const parsed = typeof marketCriteres === 'string' ? JSON.parse(marketCriteres) : marketCriteres;
      if (parsed) {
        maxTech = Number(parsed.technique) || 0;
        maxDelai = Number(parsed.delai) || 0;
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (offer && offer.notesEvaluation) {
      try {
        const parsedNotes = typeof offer.notesEvaluation === 'string' ? JSON.parse(offer.notesEvaluation) : offer.notesEvaluation;
        if (parsedNotes) {
          setNotes({
            technique: parsedNotes.technique || 0,
            delai: parsedNotes.delai || 0
          });
        }
      } catch (e) { console.error("Error parsing existing notes", e); }
    } else {
      setNotes({ technique: 0, delai: 0 });
    }
  }, [offer, isOpen]);

  if (!isOpen || !offer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notes.technique > maxTech || notes.delai > maxDelai) {
      setError("Une note dépasse le maximum autorisé par les critères du marché.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.put(`/soumissions/${offer.idOffre}/evaluate`, { notesEvaluation: notes });
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de l'évaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} />
            Évaluation Technique (Offre #{offer.idOffre})
          </h3>
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
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
            <span className="font-bold text-gray-700">Soumissionnaire:</span> {offer.nomSoumissionnaire}<br/>
            <span className="font-bold text-gray-700">Délai Proposé:</span> {offer.delaiLivraison || 'Non spécifié'}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-gray-700 block">Note Qualité Technique</label>
                <span className="text-xs text-gray-400">Maximum: {maxTech} points</span>
              </div>
              <input 
                type="number" min="0" max={maxTech} step="0.5"
                value={notes.technique} 
                onChange={e => setNotes({...notes, technique: Number(e.target.value)})}
                className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-gray-700 block">Note Délai de Livraison</label>
                <span className="text-xs text-gray-400">Maximum: {maxDelai} points</span>
              </div>
              <input 
                type="number" min="0" max={maxDelai} step="0.5"
                value={notes.delai} 
                onChange={e => setNotes({...notes, delai: Number(e.target.value)})}
                className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EvalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  offer: PropTypes.shape({
    idOffre: PropTypes.number,
    nomSoumissionnaire: PropTypes.string,
    delaiLivraison: PropTypes.string,
    notesEvaluation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  marketCriteres: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onSaveSuccess: PropTypes.func.isRequired,
};

export default EvalModal;

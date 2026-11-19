import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Bookmark, Check, Save, Trash2 } from 'lucide-react';

const SavedFilters = ({ storageKey, filters, onApply }) => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(saved)) throw new Error('Format de filtres favoris invalide.');
      setSavedFilters(saved.filter(item =>
        item && typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        item.filters && typeof item.filters === 'object'
      ));
    } catch (loadError) {
      console.error('Erreur de lecture des filtres favoris:', loadError);
      setError('Impossible de lire les filtres favoris enregistrés.');
    }
  }, [storageKey]);

  const persist = (nextFilters) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextFilters));
      setSavedFilters(nextFilters);
      setError('');
      return true;
    } catch (saveError) {
      console.error('Erreur d’enregistrement des filtres favoris:', saveError);
      setError('Impossible d’enregistrer les filtres favoris sur cet appareil.');
      return false;
    }
  };

  const saveCurrentFilters = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Donnez un nom au filtre favori.');
      return;
    }

    const saved = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      filters: { ...filters }
    };
    if (persist([...savedFilters, saved])) {
      setName('');
      setSelectedId(saved.id);
    }
  };

  const applySelectedFilter = () => {
    const selected = savedFilters.find(item => item.id === selectedId);
    if (!selected) return;
    onApply(selected.filters);
    setError('');
  };

  const deleteSelectedFilter = () => {
    if (!selectedId) return;
    const remaining = savedFilters.filter(item => item.id !== selectedId);
    if (persist(remaining)) setSelectedId('');
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <Bookmark className="h-4 w-4 text-primary" />
        Filtres favoris
      </div>
      <form onSubmit={saveCurrentFilters} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`${storageKey}-name`}>Nom du filtre favori</label>
        <input
          id={`${storageKey}-name`}
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Nommer les filtres actuels"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          maxLength={60}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Save className="h-4 w-4" />
          Enregistrer
        </button>
      </form>
      <label className="sr-only" htmlFor={`${storageKey}-saved`}>Choisir un filtre favori</label>
      <select
        id={`${storageKey}-saved`}
        value={selectedId}
        onChange={event => setSelectedId(event.target.value)}
        className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:max-w-48"
      >
        <option value="">Choisir un favori</option>
        {savedFilters.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={applySelectedFilter}
          disabled={!selectedId}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Appliquer
        </button>
        <button
          type="button"
          onClick={deleteSelectedFilter}
          disabled={!selectedId}
          aria-label="Supprimer le filtre favori sélectionné"
          title="Supprimer le favori sélectionné"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-600 sm:basis-full">{error}</p>}
    </div>
  );
};

SavedFilters.propTypes = {
  storageKey: PropTypes.string.isRequired,
  filters: PropTypes.objectOf(PropTypes.string).isRequired,
  onApply: PropTypes.func.isRequired
};

export default SavedFilters;

import { useEffect, useState } from 'react';
import { BellRing, Save } from 'lucide-react';
import api from '../services/api';

const INITIAL_THRESHOLDS = {
  demandeValidationJours: 5,
  marcheEcheanceJours: 3,
  paiementJours: 5
};

const FIELDS = [
  {
    key: 'demandeValidationJours',
    label: 'Demande sans validation',
    description: 'Rappel après le nombre de jours indiqué.'
  },
  {
    key: 'marcheEcheanceJours',
    label: 'Marché avant échéance',
    description: 'Alerte dans les jours précédant la date limite (et après son dépassement).'
  },
  {
    key: 'paiementJours',
    label: 'Paiement après réception',
    description: 'Marque le paiement comme en retard après ce délai.'
  }
];

const EcheanceAlertSettings = () => {
  const [thresholds, setThresholds] = useState(INITIAL_THRESHOLDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/admin/echeances/config')
      .then(({ data }) => {
        if (active) setThresholds(data);
      })
      .catch(requestError => {
        console.error('Erreur de chargement des seuils d’échéance:', requestError);
        if (active) setError(requestError.response?.data?.message || 'Impossible de charger les seuils.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveThresholds = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.put('/admin/echeances/config', thresholds);
      setThresholds(data.thresholds);
      setMessage(data.message);
    } catch (requestError) {
      console.error('Erreur d’enregistrement des seuils d’échéance:', requestError);
      setError(requestError.response?.data?.message || 'Impossible d’enregistrer les seuils.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <BellRing className="h-5 w-5 text-primary" />
          Seuils des alertes d’échéance
        </h2>
        <p className="mt-1 text-sm text-gray-500">Définissez les délais de rappel applicables à l’organisation.</p>
      </div>

      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={saveThresholds} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {FIELDS.map(field => (
            <label key={field.key} className="space-y-2 rounded-xl border border-gray-100 p-4">
              <span className="block text-sm font-semibold text-gray-800">{field.label}</span>
              <span className="block text-xs text-gray-500">{field.description}</span>
              <span className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="365"
                  step="1"
                  required
                  disabled={loading}
                  value={thresholds[field.key]}
                  onChange={event => setThresholds(current => ({
                    ...current,
                    [field.key]: event.target.value === '' ? '' : Number(event.target.value)
                  }))}
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  aria-label={`${field.label}, en jours`}
                />
                <span className="text-sm text-gray-500">jours</span>
              </span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">Valeurs acceptées : de 0 à 365 jours. Valeurs initiales : 5, 3 et 5 jours.</p>
          <button
            type="submit"
            disabled={loading || saving || FIELDS.some(field =>
              !Number.isInteger(thresholds[field.key]) || thresholds[field.key] < 0 || thresholds[field.key] > 365
            )}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer les seuils'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EcheanceAlertSettings;

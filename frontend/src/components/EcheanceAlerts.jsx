import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BellRing, CalendarClock, CheckCircle2, Clock3, CreditCard, RefreshCw } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const getAlertLink = (type, user) => {
  const role = user?.role?.toUpperCase().replace(/\s+/g, '_');
  if (role === 'ADMIN') return '/admin';
  if (type === 'demande') {
    if (role === 'RAF') return '/raf/demandes-systeme';
    if (role === 'CGMP') return '/cgmp/marches';
    if (role === 'CHEF_INSTITUTION') return '/chef';
    return '/demandeur/demandes';
  }
  if (type === 'marche' && role === 'CGMP') return '/cgmp/marches';
  if (role === 'RAF') return '/raf';
  if (role === 'CHEF_INSTITUTION' || role === 'CHEF_SERVICE') return '/chef';
  if (role === 'RECEPTIONISTE' || role === 'RECEPTIONNISTE') return '/reception';
  return '/demandeur';
};

const alertIcon = (type) => {
  if (type === 'demande') return Clock3;
  if (type === 'marche') return CalendarClock;
  return CreditCard;
};

const EcheanceAlerts = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/echeances');
      setAlerts(data.alerts);
      setThresholds(data.thresholds);
      setError('');
    } catch (requestError) {
      console.error('Erreur de chargement des alertes d’échéance:', requestError);
      setError(requestError.response?.data?.message || 'Les alertes ne sont pas disponibles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchAlerts]);

  const urgentCount = alerts.filter(alert => alert.severity === 'urgent').length;
  const warningCount = alerts.filter(alert => alert.severity === 'warning').length;

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="echeance-alerts-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="echeance-alerts-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <BellRing className="h-5 w-5 text-primary" />
            Alertes d’échéance
          </h2>
          <p className="mt-1 text-sm text-gray-500">Demandes à relancer, échéances de marchés et paiements à traiter.</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-xs font-medium text-gray-500">
              {urgentCount} urgent{urgentCount === 1 ? '' : 's'} · {warningCount} rappel{warningCount === 1 ? '' : 's'}
            </span>
          )}
          <button
            type="button"
            onClick={fetchAlerts}
            disabled={loading}
            aria-label="Actualiser les alertes"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading && alerts.length === 0 ? (
        <p role="status" className="py-5 text-center text-sm text-gray-500">Chargement des alertes…</p>
      ) : alerts.length === 0 && !error ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Aucune échéance à signaler pour le moment.
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {alerts.map(alert => {
            const Icon = alertIcon(alert.type);
            const tone = alert.severity === 'urgent'
              ? 'border-red-200 bg-red-50 text-red-800'
              : alert.severity === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-blue-200 bg-blue-50 text-blue-800';
            return (
              <li key={alert.id}>
                <Link
                  to={getAlertLink(alert.type, user)}
                  className={`flex h-full items-start gap-3 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${tone}`}
                >
                  <span className="rounded-lg bg-white/70 p-2"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{alert.title}</span>
                    <span className="mt-1 block text-xs opacity-80">{alert.detail}</span>
                  </span>
                  {alert.severity === 'urgent' && <AlertTriangle className="h-4 w-4 shrink-0" aria-label="Urgent" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {!loading && thresholds && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Clock3 className="h-3.5 w-3.5" />
          Rappels : demande {thresholds?.demandeValidationJours} j · marché {thresholds?.marcheEcheanceJours} j · paiement {thresholds?.paiementJours} j
        </p>
      )}
    </section>
  );
};

export default EcheanceAlerts;

import { useEffect, useState } from 'react';
import { Activity, Building2, CalendarDays, Clock3, Filter, Wallet } from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../services/api';

const DEMANDE_STATUSES = [
  'Brouillon',
  'Soumis',
  'En attente',
  'Valide',
  'Rejete',
  'Inclus dans Marché'
];

const formatNumber = (value) => Number(value || 0).toLocaleString('fr-FR', {
  maximumFractionDigits: 1
});

const DashboardMetrics = () => {
  const [filters, setFilters] = useState({
    annee: String(new Date().getFullYear()),
    service: 'tous',
    statut: 'tous'
  });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/admin/dashboard-metrics', {
          params: filters
        });
        if (active) setMetrics(response.data);
      } catch (requestError) {
        console.error('Erreur de chargement des indicateurs du tableau de bord:', requestError);
        if (active) {
          setError(requestError.response?.data?.message || 'Les indicateurs ne sont pas disponibles.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMetrics();
    return () => {
      active = false;
    };
  }, [filters]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, index) => currentYear - index);
  const maxDemandes = Math.max(...(metrics?.demandeStatuses || []).map(item => Number(item.total)), 0);
  const maxMarches = Math.max(...(metrics?.marketStatuses || []).map(item => Number(item.total)), 0);
  const summary = metrics?.summary || {};

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
  };

  return (
    <section className="space-y-5 rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="dashboard-metrics-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="dashboard-metrics-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Activity className="h-5 w-5 text-primary" />
            Indicateurs des demandes et marchés
          </h2>
          <p className="mt-1 text-sm text-gray-500">Repérez les demandes prioritaires et suivez l&apos;activité budgétaire.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="sr-only">Filtrer par année</span>
            <select
              value={filters.annee}
              onChange={event => updateFilter('annee', event.target.value)}
              className="min-w-32 bg-transparent outline-none"
            >
              <option value="tous">Toutes les années</option>
              {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          {metrics?.canChooseAnyService && (
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="sr-only">Filtrer par service</span>
              <select
                value={filters.service}
                onChange={event => updateFilter('service', event.target.value)}
                className="min-w-36 bg-transparent outline-none"
              >
                <option value="tous">Tous les services</option>
                {(metrics.services || []).map(service => (
                  <option key={service.idService} value={service.idService}>{service.nomService}</option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <Filter className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="sr-only">Filtrer par statut</span>
            <select
              value={filters.statut}
              onChange={event => updateFilter('statut', event.target.value)}
              className="min-w-36 bg-transparent outline-none"
            >
              <option value="tous">Tous les statuts</option>
              {DEMANDE_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading && metrics && <p role="status" className="text-xs text-gray-500">Actualisation des indicateurs…</p>}

      <div aria-busy={loading}>
        {loading && !metrics ? (
          <p className="py-8 text-center text-sm text-gray-500">Chargement des indicateurs…</p>
        ) : metrics && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Demandes en attente"
                value={formatNumber(summary.demandesEnAttente)}
                detail="Soumises ou en attente de validation"
                icon={Clock3}
                tone="amber"
              />
              <MetricCard
                label="Délai moyen de validation"
                value={`${formatNumber(summary.delaiMoyenJours)} j`}
                detail="De la création à la validation"
                icon={Activity}
                tone="blue"
              />
              <MetricCard
                label="Montants engagés"
                value={`${formatNumber(summary.budgetEngage)} FBU`}
                detail="Demandes validées ou incluses dans un marché"
                icon={Wallet}
                tone="emerald"
              />
              <MetricCard
                label="Demandes suivies"
                value={formatNumber(summary.totalDemandes)}
                detail="Selon les filtres sélectionnés"
                icon={Filter}
                tone="violet"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <StatusBreakdown
                title="Demandes par statut"
                items={metrics.demandeStatuses}
                max={maxDemandes}
                emptyLabel="Aucune demande pour ces filtres."
              />
              <StatusBreakdown
                title="Marchés par statut"
                items={metrics.marketStatuses}
                max={maxMarches}
                emptyLabel="Aucun marché pour ces filtres."
                marketStatuses
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const MetricCard = ({ label, value, detail, icon: Icon, tone }) => {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700'
  };

  return (
    <article className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 break-words text-xl font-bold text-gray-900">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 text-xs text-gray-500">{detail}</p>
    </article>
  );
};

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  detail: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  tone: PropTypes.oneOf(['amber', 'blue', 'emerald', 'violet']).isRequired
};

const StatusBreakdown = ({ title, items, max, emptyLabel, marketStatuses = false }) => (
  <div className="rounded-xl border border-gray-100 p-4">
    <h3 className="mb-4 text-sm font-bold text-gray-800">{title}</h3>
    {!items?.length ? (
      <p className="py-3 text-sm text-gray-500">{emptyLabel}</p>
    ) : (
      <ul className="space-y-3">
        {items.map(item => {
          const value = Number(item.total);
          const width = max > 0 ? Math.max((value / max) * 100, 4) : 0;
          const label = marketStatuses
            ? String(item.statut || 'Non défini').replaceAll('_', ' ')
            : item.statut || 'Non défini';
          return (
            <li key={item.statut || 'non-defini'}>
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className="capitalize text-gray-600">{label}</span>
                <span className="font-bold text-gray-800">{formatNumber(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

StatusBreakdown.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    statut: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })),
  max: PropTypes.number.isRequired,
  emptyLabel: PropTypes.string.isRequired,
  marketStatuses: PropTypes.bool
};

export default DashboardMetrics;

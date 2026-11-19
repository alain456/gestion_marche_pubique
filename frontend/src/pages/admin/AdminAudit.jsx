import { useCallback, useEffect, useState } from 'react';
import { Activity, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../../services/api';

const PAGE_SIZE = 25;
const entities = [
  ['demandes', 'Demandes'],
  ['marches', 'Marchés'],
  ['budgets', 'Budgets'],
  ['users', 'Utilisateurs'],
  ['roles', 'Rôles'],
  ['permissions', 'Permissions'],
  ['services', 'Services'],
  ['articles', 'Articles'],
  ['contrats', 'Contrats'],
  ['receptions', 'Réceptions'],
  ['paiements', 'Paiements'],
  ['soumissions', 'Soumissions'],
  ['attachments', 'Pièces jointes'],
  ['admin', 'Administration'],
  ['seuils', 'Seuils d’échéance'],
  ['parametres', 'Paramètres'],
  ['notifications', 'Notifications'],
  ['api', 'Autres']
];
const entityLabels = Object.fromEntries(entities);
const actionLabel = entry => {
  const route = entry.route || '';
  if (route.includes('/mark-')) return 'Mise à jour du suivi d’une demande';
  if (route.endsWith('/statut')) return 'Changement de statut d’une demande';
  if (route.endsWith('/cgmp-update')) return 'Ajustement d’une demande';
  if (route.endsWith('/config')) return 'Mise à jour des paramètres';

  const verb = {
    POST: 'Création / action sur',
    PUT: 'Modification de',
    PATCH: 'Modification de',
    DELETE: 'Suppression de'
  }[entry.methode] || 'Action sur';
  const entity = entityLabels[entry.entite] || 'Autre fonctionnalité';
  return `${verb} ${entity.toLocaleLowerCase('fr-FR')}`;
};

const csvCell = value => {
  const text = String(value ?? '').replace(/\r?\n/g, ' ');
  const safeText = /^[\s]*[=+\-@]/.test(text) && !/^[\s]*-?\d+([.,]\d+)?$/.test(text)
    ? `'${text}`
    : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

const AdminAudit = ({ personal = false }) => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    userId: '',
    entity: '',
    method: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(personal ? '/audit' : '/admin/audit', {
        params: {
          ...filters,
          page,
          limit: PAGE_SIZE
        }
      });
      setEntries(response.data.entries);
      setPagination(response.data.pagination);
    } catch (requestError) {
      console.error('Erreur lors du chargement du journal d’audit:', requestError);
      setError(requestError.response?.data?.message || 'Impossible de charger le journal d’audit.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, personal]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  const exportPage = () => {
    if (!entries.length) return;
    const columns = [
      ['Date', row => row.dateAction],
      ['Activité', actionLabel],
      ['Fonctionnalité', row => entityLabels[row.entite] || row.entite],
      ['ID objet', row => row.idEntite],
      ...(!personal ? [
        ['Utilisateur', row => row.nomUtilisateur],
        ['Rôle', row => row.roleUtilisateur],
        ['Méthode', row => row.methode],
        ['Route', row => row.route],
        ['Code HTTP', row => row.codeHttp],
        ['Adresse IP', row => row.adresseIp],
        ['Navigateur', row => row.agentUtilisateur]
      ] : [])
    ];
    const csv = [
      columns.map(([label]) => csvCell(label)).join(';'),
      ...entries.map(row => columns.map(([, value]) => csvCell(value(row))).join(';'))
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personal ? 'mon-activite' : 'journal-audit'}-page-${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Activity className="h-6 w-6 text-primary" />
            {personal ? 'Mon activité' : 'Journal d’audit'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {personal
              ? 'Retrouvez les actions réussies effectuées avec votre compte. Les contenus des formulaires et mots de passe ne sont pas enregistrés.'
              : 'Historique des opérations réussies dans l’application. Les contenus des formulaires et mots de passe ne sont pas journalisés.'}
          </p>
        </div>
        <button
          type="button"
          onClick={exportPage}
          disabled={!entries.length}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter cette page (CSV)
        </button>
      </header>

      <section aria-label="Filtres du journal" className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm text-slate-600">
          <span>{personal ? 'Recherche dans mes activités' : 'Recherche utilisateur, rôle ou route'}</span>
          <span className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={event => updateFilter('search', event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3"
              placeholder={personal ? 'Ex. /api/demandes' : 'Ex. Admin, RAF, /api/users'}
            />
          </span>
        </label>
        {!personal && <label className="space-y-1 text-sm text-slate-600">
          <span>Utilisateur (ID)</span>
          <input
            type="number"
            min="1"
            value={filters.userId}
            onChange={event => updateFilter('userId', event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3"
            placeholder="Tous"
          />
        </label>}
        <label className="space-y-1 text-sm text-slate-600">
          <span>Entité</span>
          <select value={filters.entity} onChange={event => updateFilter('entity', event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 px-3">
            <option value="">Toutes</option>
            {entities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-600">
          <span>Opération</span>
          <select value={filters.method} onChange={event => updateFilter('method', event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 px-3">
            <option value="">Toutes</option>
            <option value="POST">Création / action (POST)</option>
            <option value="PUT">Modification (PUT)</option>
            <option value="PATCH">Modification partielle (PATCH)</option>
            <option value="DELETE">Suppression (DELETE)</option>
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-600">
          <span>Du</span>
          <input type="date" value={filters.from} max={filters.to || undefined} onChange={event => updateFilter('from', event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 px-3" />
        </label>
        <label className="space-y-1 text-sm text-slate-600">
          <span>Au</span>
          <input type="date" value={filters.to} min={filters.from || undefined} onChange={event => updateFilter('to', event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 px-3" />
        </label>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-800">{personal ? 'Mes opérations enregistrées' : 'Activité enregistrée'}</h2>
          <p className="text-sm text-slate-500">{pagination.total.toLocaleString('fr-FR')} entrée(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {(personal
                  ? ['Date et heure', 'Activité', 'Fonctionnalité', 'Objet']
                  : ['Date et heure', 'Utilisateur', 'Activité', 'Fonctionnalité', 'Route', 'HTTP', 'Adresse IP']
                ).map(label => (
                  <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={personal ? 4 : 7} className="px-4 py-12 text-center text-sm text-slate-500">Chargement du journal…</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={personal ? 4 : 7} className="px-4 py-12 text-center text-sm text-slate-500">Aucune opération trouvée pour ces filtres.</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.idAudit} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{new Date(entry.dateAction).toLocaleString('fr-FR')}</td>
                  {personal ? (
                    <>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        <span className="font-semibold">{actionLabel(entry)}</span>
                        <span className="mt-1 block text-xs text-slate-500">{entry.methode}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{entityLabels[entry.entite] || entry.entite}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{entry.idEntite ? `#${entry.idEntite}` : '—'}</td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-800">{entry.nomUtilisateur}</span>
                        <span className="block text-xs text-slate-500">ID {entry.idUtilisateur} · {entry.roleUtilisateur}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-800">{actionLabel(entry)}</span>
                        <span className="mt-1 block text-xs text-slate-500">{entry.methode}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{entityLabels[entry.entite] || entry.entite}{entry.idEntite ? ` #${entry.idEntite}` : ''}</td>
                      <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-slate-600">{entry.route}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.codeHttp}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{entry.adresseIp || '—'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.totalPages ? page : 0} sur {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage(current => current - 1)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>
            <button type="button" disabled={loading || page >= pagination.totalPages} onClick={() => setPage(current => current + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:opacity-50">
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

AdminAudit.propTypes = {
  personal: PropTypes.bool
};

export default AdminAudit;

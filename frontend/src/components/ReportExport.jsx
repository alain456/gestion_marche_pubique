import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, FileSpreadsheet, FileText } from 'lucide-react';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const getCellValue = (row, column) => {
  const value = typeof column.value === 'function' ? column.value(row) : row[column.key];
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value ?? '';
};

const getDateValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const datePart = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (datePart) return datePart;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const sanitizeFileName = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '');

const ReportExport = ({ rows, columns, fileName, title, dateField, yearField, criteria }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [error, setError] = useState('');

  const filteredRows = useMemo(() => rows.filter(row => {
    if (dateField) {
      const date = getDateValue(row[dateField]);
      if (!date) return !fromDate && !toDate;
      const dateOnly = date;
      if (fromDate && dateOnly < fromDate) return false;
      if (toDate && dateOnly > toDate) return false;
    }
    if (yearField) {
      const year = Number(row[yearField]);
      if (fromYear && (!year || year < Number(fromYear))) return false;
      if (toYear && (!year || year > Number(toYear))) return false;
    }
    return true;
  }), [rows, dateField, yearField, fromDate, toDate, fromYear, toYear]);

  const downloadExcelCsv = () => {
    if (!filteredRows.length) {
      setError('Aucune ligne à exporter avec cette période.');
      return;
    }

    const protectCell = (value) => {
      const text = String(value ?? '').replace(/\r?\n/g, ' ');
      const safeText = /^[\s]*[=+\-@]/.test(text) && !/^[\s]*-?\d+([.,]\d+)?$/.test(text)
        ? `'${text}`
        : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const csv = [
      columns.map(column => protectCell(column.label)).join(';'),
      ...filteredRows.map(row => columns.map(column => protectCell(getCellValue(row, column))).join(';'))
    ].join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(fileName)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setError('');
  };

  const printPdf = () => {
    if (!filteredRows.length) {
      setError('Aucune ligne à exporter avec cette période.');
      return;
    }

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      setError('Autorisez les fenêtres contextuelles pour générer le rapport PDF.');
      return;
    }
    reportWindow.opener = null;

    const period = dateField
      ? [fromDate && `du ${fromDate}`, toDate && `au ${toDate}`].filter(Boolean).join(' ')
      : yearField
        ? [fromYear && `de ${fromYear}`, toYear && `à ${toYear}`].filter(Boolean).join(' ')
        : '';
    const headerHtml = columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('');
    const rowsHtml = filteredRows.map(row => (
      `<tr>${columns.map(column => `<td>${escapeHtml(getCellValue(row, column))}</td>`).join('')}</tr>`
    )).join('');
    const criteriaHtml = [criteria, period].filter(Boolean).map(escapeHtml).join(' · ');

    reportWindow.document.open();
    reportWindow.document.write(`<!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${escapeHtml(title)}</title>
          <style>
            body{font:12px Arial,sans-serif;color:#172033;margin:24px}
            h1{font-size:20px;margin:0 0 6px}
            p{color:#536174;margin:0 0 16px}
            table{width:100%;border-collapse:collapse}
            th,td{border:1px solid #d5dbe5;padding:7px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
            th{background:#eef2f8}
            tr:nth-child(even){background:#f8fafc}
            @page{size:landscape;margin:12mm}
            @media print{body{margin:0}}
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <p>${filteredRows.length} ligne(s)${criteriaHtml ? ` · ${criteriaHtml}` : ''} · Généré le ${escapeHtml(new Date().toLocaleString('fr-FR'))}</p>
          <table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
          <script>window.addEventListener('load',()=>{window.focus();window.print();});</script>
        </body>
      </html>`);
    reportWindow.document.close();
    setError('');
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-surface p-4" aria-label={`Exporter ${title}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Exporter le rapport
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {filteredRows.length} ligne(s) · Les filtres de la page sont conservés{criteria ? ` · ${criteria}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {dateField && (
            <>
              <label className="space-y-1 text-xs text-gray-600">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Du</span>
                <input type="date" value={fromDate} max={toDate || undefined} onChange={event => setFromDate(event.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm" />
              </label>
              <label className="space-y-1 text-xs text-gray-600">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Au</span>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={event => setToDate(event.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm" />
              </label>
            </>
          )}
          {yearField && (
            <>
              <label className="space-y-1 text-xs text-gray-600">
                <span>Exercice min.</span>
                <input type="number" min="2000" max="2100" value={fromYear} onChange={event => setFromYear(event.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm sm:w-28" />
              </label>
              <label className="space-y-1 text-xs text-gray-600">
                <span>Exercice max.</span>
                <input type="number" min={fromYear || 2000} max="2100" value={toYear} onChange={event => setToYear(event.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm sm:w-28" />
              </label>
            </>
          )}
          <button type="button" onClick={downloadExcelCsv} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
            <FileSpreadsheet className="h-4 w-4" />
            Excel (CSV)
          </button>
          <button type="button" onClick={printPdf} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
            <FileText className="h-4 w-4" />
            PDF / Imprimer
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
};

ReportExport.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.func
  })).isRequired,
  fileName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  dateField: PropTypes.string,
  yearField: PropTypes.string,
  criteria: PropTypes.string
};

export default ReportExport;

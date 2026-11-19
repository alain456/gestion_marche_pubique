import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Download, FilePlus2, FileText, History, LoaderCircle } from 'lucide-react';
import api from '../services/api';

const formatSize = (size) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

const DossierAttachments = ({ entityType, entityId, canUpload = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const endpoint = `/attachments/${entityType}/${entityId}`;

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(endpoint);
      setAttachments(response.data);
    } catch (requestError) {
      console.error('Erreur lors du chargement des pièces jointes:', requestError);
      setError(requestError.response?.data?.message || 'Impossible de charger les pièces jointes.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (isOpen) loadAttachments();
  }, [isOpen, loadAttachments]);

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10 Mo.');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setError('');
    try {
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await loadAttachments();
    } catch (requestError) {
      console.error('Erreur lors de l’ajout de la pièce jointe:', requestError);
      setError(requestError.response?.data?.message || 'Impossible d’ajouter ce fichier.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await api.get(`/attachments/file/${attachment.idPieceJointe}`, {
        responseType: 'blob'
      });
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.nomOriginal;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (requestError) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', requestError);
      setError(requestError.response?.data?.message || 'Impossible de télécharger ce fichier.');
    }
  };

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(open => !open)}
          className="flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <History className="h-4 w-4 text-primary" />
          Documents et versions
        </button>
        {canUpload && isOpen && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelected}
              className="sr-only"
              aria-label="Choisir un fichier à joindre"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
            >
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
              {uploading ? 'Envoi en cours…' : 'Ajouter une version'}
            </button>
          </>
        )}
      </div>
      {isOpen && (
        <div className="border-t border-slate-100 p-3">
          <p className="mb-3 text-xs leading-5 text-slate-500">
            PDF, Word, Excel ou image · 10 Mo maximum. Un fichier portant le même nom crée une nouvelle version ; les versions précédentes restent disponibles.
          </p>
          {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {loading ? (
            <p role="status" className="flex items-center gap-2 py-2 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Chargement des fichiers…
            </p>
          ) : attachments.length === 0 ? (
            <p className="py-2 text-sm text-slate-500">Aucune pièce jointe pour ce dossier.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {attachments.map(attachment => (
                <li key={attachment.idPieceJointe} className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium text-slate-800">{attachment.nomOriginal}</p>
                      <p className="text-xs text-slate-500">
                        Version {attachment.version} · {formatSize(Number(attachment.tailleOctets))} · {attachment.nomUtilisateur}
                        {attachment.dateAjout ? ` · ${new Date(attachment.dateAjout).toLocaleString('fr-FR')}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:self-auto"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

DossierAttachments.propTypes = {
  entityType: PropTypes.oneOf(['demande', 'marche', 'reception', 'paiement']).isRequired,
  entityId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  canUpload: PropTypes.bool
};

export default DossierAttachments;

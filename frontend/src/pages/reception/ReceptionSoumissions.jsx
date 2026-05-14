import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  PlusCircle, 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Hash,
  Users,
  Info,
  Printer,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  MessageSquare,
  Lock,
  Clock
} from 'lucide-react';

const ReceptionSoumissions = () => {
  const { user } = useContext(AuthContext);
  const [marches, setMarches] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // États pour la demande de modification
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMotif, setRequestMotif] = useState('');
  const [requestTargetId, setRequestTargetId] = useState(null);

  const [form, setForm] = useState({
    idMarche: '',
    nomSoumissionnaire: '',
    adresse: '',
    telephone: '',
    email: '',
    referenceAppelOffre: '',
    dateSoumission: new Date().toISOString().split('T')[0],
    montantPropose: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [marchesRes, offersRes] = await Promise.all([
        api.get('/marches'),
        api.get('/soumissions')
      ]);
      setMarches(marchesRes.data);
      setOffers(offersRes.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      idMarche: '',
      nomSoumissionnaire: '',
      adresse: '',
      telephone: '',
      email: '',
      referenceAppelOffre: '',
      dateSoumission: new Date().toISOString().split('T')[0],
      montantPropose: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idMarche) {
      setError('Veuillez sélectionner un marché.');
      return;
    }

    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // On envoie aussi l'autorisationModification pour que le backend sache qu'il doit réinitialiser les flags
        await api.put(`/soumissions/${editId}`, { ...form, autorisationModification: 1 });
        setMessage('Offre mise à jour avec succès.');
      } else {
        await api.post('/soumissions', form);
        setMessage('Offre enregistrée avec succès.');
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'opération.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    if (user?.role === 'Receptioniste' && !offer.autorisationModification) {
      alert("Vous n'avez pas l'autorisation de modifier cette offre. Veuillez faire une demande au RAF.");
      return;
    }

    setForm({
      idMarche: offer.idMarche,
      nomSoumissionnaire: offer.nomSoumissionnaire,
      adresse: offer.adresse,
      telephone: offer.telephone,
      email: offer.email,
      referenceAppelOffre: offer.referenceAppelOffre,
      dateSoumission: new Date(offer.dateSoumission).toISOString().split('T')[0],
      montantPropose: offer.montantPropose
    });
    setIsEditing(true);
    setEditId(offer.idOffre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (offer) => {
    if (user?.role === 'Receptioniste' && !offer.autorisationModification) {
      alert("Vous n'avez pas l'autorisation de supprimer cette offre.");
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await api.delete(`/soumissions/${offer.idOffre}`);
        setMessage('Offre supprimée avec succès.');
        fetchData();
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const handleRequestModification = async () => {
    if (!requestMotif.trim()) {
      alert("Veuillez saisir un motif.");
      return;
    }

    try {
      await api.post(`/soumissions/${requestTargetId}/request-modification`, { motifModification: requestMotif });
      setMessage('Demande de modification envoyée au RAF.');
      setShowRequestModal(false);
      setRequestMotif('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'envoi de la demande.');
    }
  };

  const printReceipt = (offer) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Récépissé de Dépôt d'Offre #${offer.idOffre}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .content { margin-bottom: 40px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { border: 1px solid #000; width: 200px; height: 100px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RÉCÉPISSÉ DE DÉPÔT D'OFFRE</h1>
            <p>SETIC - Gestion des Marchés Publics</p>
          </div>
          <div class="content">
            <div class="row"><span class="label">Référence Offre :</span> <span>#${offer.idOffre}</span></div>
            <div class="row"><span class="label">Marché concerné :</span> <span>Marché #${offer.idMarche}</span></div>
            <div class="row"><span class="label">Soumissionnaire :</span> <span>${offer.nomSoumissionnaire}</span></div>
            <div class="row"><span class="label">Date de dépôt :</span> <span>${new Date(offer.dateSoumission).toLocaleDateString()}</span></div>
            <div class="row"><span class="label">Montant Proposé :</span> <span>${Number(offer.montantPropose).toLocaleString()} FBU</span></div>
            <div class="row"><span class="label">Référence Appel d'Offre :</span> <span>${offer.referenceAppelOffre}</span></div>
          </div>
          <div class="footer">
            <div>
              <p>Le Réceptionniste</p>
              <div class="signature-box"></div>
            </div>
            <div>
              <p>Le Déposant</p>
              <div class="signature-box"></div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-primary h-8 w-8" />
            Enregistrement des Offres
          </h1>
          <p className="text-gray-500 mt-2">Saisie des soumissions reçues.</p>
        </div>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${message ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {message || error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className={`${isEditing ? 'bg-amber-500' : 'bg-primary'} px-8 py-5 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {isEditing ? <Edit2 className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
            <h2 className="text-xl font-bold">{isEditing ? `Modifier l'Offre #${editId}` : 'Nouveau Dépôt d\'Offre'}</h2>
          </div>
          {isEditing && (
            <button onClick={resetForm} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ... (le reste du formulaire reste identique) ... */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Marché Concerné</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all font-bold text-gray-800 appearance-none"
                value={form.idMarche}
                onChange={(e) => setForm({...form, idMarche: e.target.value})}
              >
                <option value="">Sélectionnez le marché...</option>
                {marches.map(m => (
                  <option key={m.idMarche} value={m.idMarche}>ID: {m.idMarche} - {m.modePassation}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Soumissionnaire</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Nom du soumissionnaire"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                value={form.nomSoumissionnaire}
                onChange={(e) => setForm({...form, nomSoumissionnaire: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Téléphone ngendanwa</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                value={form.telephone}
                onChange={(e) => setForm({...form, telephone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                value={form.adresse}
                onChange={(e) => setForm({...form, adresse: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant (FBU)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-primary"
                value={form.montantPropose}
                onChange={(e) => setForm({...form, montantPropose: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                readOnly
                className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none cursor-not-allowed font-semibold text-gray-500"
                value={form.dateSoumission}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Référence Appel d&apos;Offre</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                value={form.referenceAppelOffre}
                onChange={(e) => setForm({...form, referenceAppelOffre: e.target.value})}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-5 ${isEditing ? 'bg-amber-500' : 'bg-primary'} text-white rounded-2xl font-bold text-lg disabled:opacity-70`}
            >
              {isSubmitting ? 'Opération...' : (isEditing ? 'Mettre à jour' : 'Enregistrer Offre')}
            </button>
            {isEditing && <button type="button" onClick={resetForm} className="px-8 py-5 bg-gray-100 rounded-2xl">Annuler</button>}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-primary h-6 w-6" />
          Historique
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                  <th className="px-8 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Statut Modif</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map(o => (
                  <tr key={o.idOffre} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-8 py-6 font-bold text-gray-700">#{o.idOffre}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{o.nomSoumissionnaire}</div>
                      <div className="text-xs text-gray-500">{o.email}</div>
                      <div className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> {o.telephone}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-medium text-gray-700">Marché #{o.idMarche}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{o.referenceAppelOffre}</div>
                    </td>
                    <td className="px-8 py-6 text-gray-500">{new Date(o.dateSoumission).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right font-bold text-primary">{Number(o.montantPropose).toLocaleString()} FBU</td>
                    <td className="px-8 py-6 text-center">
                      {o.demandeModification === 1 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" /> En attente RAF
                        </span>
                      )}
                      {o.autorisationModification === 1 && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Autorisé
                        </span>
                      )}
                      {!o.demandeModification && !o.autorisationModification && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => printReceipt(o)} className="p-2 bg-gray-100 rounded-xl" title="Imprimer"><Printer className="h-4 w-4" /></button>
                        
                        {user?.role === 'Receptioniste' ? (
                          // Pour le réceptionniste
                          o.autorisationModification === 1 ? (
                            <button onClick={() => handleEdit(o)} className="p-2 bg-amber-50 text-amber-600 rounded-xl" title="Modifier"><Edit2 className="h-4 w-4" /></button>
                          ) : (
                            <button 
                              onClick={() => { setRequestTargetId(o.idOffre); setShowRequestModal(true); }} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl" 
                              title="Demander modification"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )
                        ) : (
                          // Pour les autres rôles (Admin, CGMP, etc.)
                          <>
                            <button onClick={() => handleEdit(o)} className="p-2 bg-amber-50 text-amber-600 rounded-xl" title="Modifier"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(o)} className="p-2 bg-red-50 text-red-600 rounded-xl" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Demande de Modification */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Demande de Modification
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Vous n&apos;avez pas le droit de modifier cette offre directement. Veuillez expliquer au RAF pourquoi une modification est nécessaire.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Motif de la modification</label>
                <textarea 
                  rows="4"
                  value={requestMotif}
                  onChange={(e) => setRequestMotif(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Erreur de saisie sur le montant, erreur de nom..."
                ></textarea>
              </div>
              <button 
                onClick={handleRequestModification}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-blue-800 transition mt-2 flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" /> Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionSoumissions;

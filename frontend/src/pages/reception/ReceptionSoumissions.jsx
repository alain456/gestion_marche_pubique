import { useState, useEffect } from 'react';
import api from '../../services/api';
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
  X
} from 'lucide-react';

const ReceptionSoumissions = () => {
  const [marches, setMarches] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
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
        await api.put(`/soumissions/${editId}`, form);
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

  const handleDelete = async (idOffre) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await api.delete(`/soumissions/${idOffre}`);
        setMessage('Offre supprimée avec succès.');
        fetchData();
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la suppression.');
      }
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

      <div className="bg-surface rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className={`${isEditing ? 'bg-amber-500' : 'bg-primary'} px-8 py-5 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {isEditing ? <Edit2 className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
            <h2 className="text-xl font-bold">{isEditing ? `Modifier l'Offre #${editId}` : 'Nouveau Dépôt d\'Offre'}</h2>
          </div>
          {isEditing && (
            <button onClick={resetForm} className="bg-surface/20 hover:bg-surface/30 p-2 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Téléphone</label>
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
        <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
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
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-medium text-gray-700">Marché #{o.idMarche}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{o.referenceAppelOffre}</div>
                    </td>
                    <td className="px-8 py-6 font-semibold text-gray-600">{o.telephone}</td>
                    <td className="px-8 py-6 text-gray-500">{new Date(o.dateSoumission).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right font-bold text-primary">{Number(o.montantPropose).toLocaleString()} FBU</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => printReceipt(o)} className="p-2 bg-gray-100 rounded-xl" title="Imprimer"><Printer className="h-4 w-4" /></button>
                        <button onClick={() => handleEdit(o)} className="p-2 bg-amber-50 text-amber-600 rounded-xl" title="Modifier"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(o.idOffre)} className="p-2 bg-red-50 text-red-600 rounded-xl" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionSoumissions;

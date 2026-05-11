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
  Printer
} from 'lucide-react';

const ReceptionSoumissions = () => {
  const [marches, setMarches] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      await api.post('/soumissions', form);
      setMessage('Offre enregistrée avec succès.');
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
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de l'offre.");
    } finally {
      setIsSubmitting(false);
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

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Chargement des données...</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-primary h-8 w-8" />
            Enregistrement des Offres
          </h1>
          <p className="text-gray-500 mt-2">Saisie directe des soumissions reçues.</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Colonne Formulaire */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-primary px-8 py-5 text-white flex items-center gap-3">
              <PlusCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Nouveau Dépôt d&apos;Offre</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sélection du Marché */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Marché Concerné</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-800 appearance-none"
                    value={form.idMarche}
                    onChange={(e) => setForm({...form, idMarche: e.target.value})}
                  >
                    <option value="">Sélectionnez le marché...</option>
                    {marches.map(m => (
                      <option key={m.idMarche} value={m.idMarche}>
                        ID: {m.idMarche} - {m.modePassation} (Demande #{m.idDemande})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nom du Soumissionnaire */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nom complet du Soumissionnaire / Entreprise</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entreprise de BTP S.A."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                    value={form.nomSoumissionnaire}
                    onChange={(e) => setForm({...form, nomSoumissionnaire: e.target.value})}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="+257 ..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                    placeholder="contact@entreprise.bi"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Adresse Physique</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Bujumbura, Quartier ..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.adresse}
                    onChange={(e) => setForm({...form, adresse: e.target.value})}
                  />
                </div>
              </div>

              {/* Montant et Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant Proposé (FBU)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary text-lg"
                    value={form.montantPropose}
                    onChange={(e) => setForm({...form, montantPropose: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Réception</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                    value={form.dateSoumission}
                    onChange={(e) => setForm({...form, dateSoumission: e.target.value})}
                  />
                </div>
              </div>

              {/* Référence */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Référence Appel d&apos;Offre</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: AO/2026/001"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.referenceAppelOffre}
                    onChange={(e) => setForm({...form, referenceAppelOffre: e.target.value})}
                  />
                </div>
              </div>

              {/* Bouton de Soumission */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6" />
                      Enregistrer l&apos;Offre Officiellement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Historique des Dépôts */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-primary h-6 w-6" />
          Historique des Soumissions
        </h3>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID Offre</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Soumissionnaire</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marché</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-gray-400 font-medium italic">
                      Aucune offre enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  offers.map(o => (
                    <tr key={o.idOffre} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-700">#{o.idOffre}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{o.nomSoumissionnaire}</div>
                        <div className="text-xs text-gray-500">{o.email}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">Marché #{o.idMarche}</div>
                        <div className="text-[10px] text-gray-400 uppercase">{o.modePassation}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                        {new Date(o.dateSoumission).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-primary">{Number(o.montantPropose).toLocaleString()} FBU</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => printReceipt(o)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Imprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionSoumissions;

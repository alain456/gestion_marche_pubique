import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info,
  DollarSign,
  Gavel,
  Calendar,
  User,
  MessageSquare,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const CgmpMarches = () => {
  const [marches, setMarches] = useState([]);
  const [validatedDemands, setValidatedDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  
  const [form, setForm] = useState({
    idDemande: '',
    montantEstime: '',
    modePassation: '',
    justificationChoix: '',
    seuilReglementaireApplique: '',
    dateSelection: new Date().toISOString().split('T')[0],
    validateur: '',
    statut: 'en attente',
    dateCloture: '',
    cloturePar: '',
    commentaire: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showDetails, setShowDetails] = useState(false);
  const [selectedMarche, setSelectedMarche] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    statut: '',
    dateCloture: '',
    cloturePar: '',
    commentaire: ''
  });

  const fetchData = async () => {
    try {
      const [marchesRes, demandsRes] = await Promise.all([
        api.get('/marches'),
        api.get('/demandes')
      ]);
      setMarches(marchesRes.data);
      // On filtre les demandes validées (statut === 'Valide') qui n'ont pas encore de marché
      // Pour l'instant on se base sur le statut 'Valide'
      const pending = demandsRes.data.filter(d => d.statut === 'Valide' && !marchesRes.data.find(m => m.idDemande === d.idDemande));
      setValidatedDemands(pending);
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

  const handleCreateMarket = (demand) => {
    setSelectedDemand(demand);
    setForm(prev => ({ 
      ...prev, 
      idDemande: demand.idDemande,
      montantEstime: demand.montantEstimeBudget || '' 
    }));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/marches', form);
      setMessage('Marché créé et publié avec succès.');
      setShowForm(false);
      setForm({
        idDemande: '',
        montantEstime: '',
        modePassation: '',
        justificationChoix: '',
        seuilReglementaireApplique: '',
        dateSelection: new Date().toISOString().split('T')[0],
        validateur: '',
        statut: 'en attente',
        dateCloture: '',
        cloturePar: '',
        commentaire: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création du marché.');
    }
  };

  const handleManage = (marche) => {
    setSelectedMarche(marche);
    setUpdateForm({
      statut: marche.statut,
      montantEstime: marche.montantEstime,
      modePassation: marche.modePassation,
      justificationChoix: marche.justificationChoix,
      dateSelection: marche.dateSelection ? new Date(marche.dateSelection).toISOString().split('T')[0] : '',
      validateur: marche.validateur,
      dateCloture: marche.dateCloture ? new Date(marche.dateCloture).toISOString().split('T')[0] : '',
      cloturePar: marche.cloturePar || '',
      commentaire: marche.commentaire || ''
    });
    setShowDetails(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.put(`/marches/${selectedMarche.idMarche}`, updateForm);
      setMessage('Marché mis à jour avec succès.');
      setShowDetails(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du marché.');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Chargement des marchés...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gavel className="text-primary h-8 w-8" />
            Gestion des Marchés Publics
          </h1>
          <p className="text-gray-500 mt-2">Créez et suivez les appels d&apos;offres pour les demandes validées.</p>
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

      {/* Formulaire de création de marché */}
      {showForm && (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-6 bg-primary text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Nouveau Dossier d&apos;Appel d&apos;Offres</h2>
              <p className="text-blue-100 text-sm mt-1">
                Demande #{selectedDemand?.idDemande} — {selectedDemand?.nomService || selectedDemand?.roleDemandeur || 'Direction Générale'} 
                {selectedDemand?.nomDemandeur && ` (${selectedDemand.nomDemandeur})`}
              </p>
              {selectedDemand?.motif && (
                <div className="mt-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs italic">
                  Note RAF: {selectedDemand.motif}
                </div>
              )}

            </div>
            <button onClick={() => setShowForm(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant Estimé (FBU)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  value={form.montantEstime}
                  onChange={(e) => setForm({...form, montantEstime: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mode de Passation</label>
              <div className="relative">
                <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  required
                  value={form.modePassation}
                  onChange={(e) => setForm({...form, modePassation: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner...</option>
                  <option value="AO">Appel d&apos;Offres</option>
                  <option value="AOR">Appel d&apos;Offres Restreint</option>
                  <option value="PVN">Procédure avec Négociation</option>
                  <option value="GG">Gré à Gré </option>
                  <option value="DC">Dialogue competitif</option>
                  <option value="PA">Procedure adapte</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Seuil Règlementaire Appliqué</label>
              <div className="relative">
                <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  required
                  value={form.seuilReglementaireApplique}
                  onChange={(e) => setForm({...form, seuilReglementaireApplique: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner un seuil...</option>
                  <optgroup label="Administrations Centrales / Entr. Publiques">
                    <option value="Travaux - Admin (> 10M BIF)">Travaux (≥ 10 000 000 BIF)</option>
                    <option value="Fournitures/Services - Admin (> 5M BIF)">Fournitures/Services (≥ 5 000 000 BIF)</option>
                  </optgroup>
                  <optgroup label="Communes (Collectivités)">
                    <option value="Travaux - Communes (> 12M BIF)">Travaux (≥ 12 000 000 BIF)</option>
                    <option value="Fournitures/Services - Communes (> 10M BIF)">Fournitures/Services (≥ 10 000 000 BIF)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Sélection</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={form.dateSelection}
                  onChange={(e) => setForm({...form, dateSelection: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Clôture</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={form.dateCloture}
                  onChange={(e) => setForm({...form, dateCloture: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Validateur / Responsable</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom du validateur"
                  value={form.validateur}
                  onChange={(e) => setForm({...form, validateur: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Statut Initial</label>
              <div className="relative">
                <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.statut}
                  onChange={(e) => setForm({...form, statut: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionner un statut...</option>
                  {/* <option value="en attente">En attente</option> */}
                  <option value="publie">Publié</option>
                  <option value="attribution">Attribue</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="cloture">Clôturé</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Clôturé Par (Optionnel)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom de la personne"
                  value={form.cloturePar}
                  onChange={(e) => setForm({...form, cloturePar: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Justification du choix du mode de passation</label>
              <textarea
                rows="2"
                value={form.justificationChoix}
                onChange={(e) => setForm({...form, justificationChoix: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="Expliquez pourquoi ce mode de passation a été retenu..."
              ></textarea>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Commentaire additionnel</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                <textarea
                  rows="2"
                  value={form.commentaire}
                  onChange={(e) => setForm({...form, commentaire: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="Informations complémentaires..."
                ></textarea>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4">
               <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
               >
                 Annuler
               </button>
               <button 
                type="submit"
                className="px-10 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
               >
                 <PlusCircle className="h-5 w-5" />
                 Publier le Marché
               </button>
            </div>
          </form>
        </section>
      )}

      {/* Modal de gestion du marché */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestion du Marché #{selectedMarche?.idMarche}</h2>
                <p className="text-gray-400 text-sm">
                  Demande #{selectedMarche?.idDemande} — {selectedMarche?.nomService || selectedMarche?.roleDemandeur || 'Direction Générale'}
                  {selectedMarche?.nomDemandeur && ` (${selectedMarche.nomDemandeur})`}
                </p>
              </div>
              <button onClick={() => setShowDetails(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations existantes (Lecture seule ou Modifiables) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Montant Estimé (FBU)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={updateForm.montantEstime || ''}
                      onChange={(e) => setUpdateForm({...updateForm, montantEstime: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mode de Passation</label>
                  <div className="relative">
                    <Gavel className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={updateForm.modePassation || ''}
                      onChange={(e) => setUpdateForm({...updateForm, modePassation: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                    >
                      <option value="AO">Appel d&apos;Offres</option>
                      <option value="AOR">Appel d&apos;Offres Restreint</option>
                      <option value="PVN">Procédure avec Négociation</option>
                      <option value="GG">Gré à Gré</option>
                      <option value="DC">Dialogue competitif</option>
                      <option value="PA">Procedure adapte</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Sélection</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={updateForm.dateSelection || ''}
                      onChange={(e) => setUpdateForm({...updateForm, dateSelection: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Validateur / Responsable</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={updateForm.validateur || ''}
                      onChange={(e) => setUpdateForm({...updateForm, validateur: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Justification du choix</label>
                  <textarea
                    rows="2"
                    value={updateForm.justificationChoix || ''}
                    onChange={(e) => setUpdateForm({...updateForm, justificationChoix: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  ></textarea>
                </div>

                <div className="md:col-span-2 h-px bg-gray-100 my-4"></div>
                <h3 className="md:col-span-2 text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suivi et Clôture
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Statut du Marché</label>
                  <div className="relative">
                    <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={updateForm.statut}
                      onChange={(e) => setUpdateForm({...updateForm, statut: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none font-bold text-primary"
                    >
                      <option value="en attente">En attente</option>
                      <option value="publie">Publié</option>
                      <option value="attribution">Attribué</option>
                      <option value="suspendu">Suspendu</option>
                      <option value="cloture">Clôturé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date de Clôture</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={updateForm.dateCloture}
                      onChange={(e) => setUpdateForm({...updateForm, dateCloture: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Clôturé Par</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nom du responsable de clôture"
                      value={updateForm.cloturePar}
                      onChange={(e) => setUpdateForm({...updateForm, cloturePar: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Commentaires / Rapport Final</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                    <textarea
                      rows="3"
                      value={updateForm.commentaire}
                      onChange={(e) => setUpdateForm({...updateForm, commentaire: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="Informations sur la fin du marché..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-50 sticky bottom-0 bg-white pb-2">
                <button 
                  type="button" 
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des demandes validées en attente */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <AlertCircle className="text-amber-500" />
          Demandes Validées (En attente de Marché)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validatedDemands.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
               Aucune demande validée en attente de traitement.
            </div>
          ) : (
            validatedDemands.map(d => (
              <div key={d.idDemande} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                    {d.idDemande}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    Budget Validé
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {d.nomService || d.roleDemandeur || 'Direction Générale'}
                </h3>
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  {d.nomDemandeur || 'Demandeur inconnu'}
                </p>
                <p className="text-sm text-gray-500 mb-2">{d.typeMarche}</p>
                
                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Exercice :</span>
                    <span className="font-bold text-gray-700">{d.exerciceBudgetaire || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Budget estimé :</span>
                    <span className="font-bold text-primary">{d.montantEstimeBudget ? Number(d.montantEstimeBudget).toLocaleString() : 0} FBU</span>
                  </div>
                  {d.motif && (
                    <div className="mt-2 pt-2 border-t border-gray-100 italic text-[10px] text-emerald-600 leading-tight">
                      Note RAF: {d.motif}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Le {new Date(d.dateDemande).toLocaleDateString()}</span>
                  <button 
                    onClick={() => handleCreateMarket(d)}
                    className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all"
                  >
                    Gérer le marché
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Liste des marchés existants */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            Marchés Publics Enregistrés
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID / Demande</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Passation</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Montant Estimé</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Clôture</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {marches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-gray-400">Aucun marché enregistré.</td>
                </tr>
              ) : (
                marches.map(m => (
                  <tr key={m.idMarche} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {m.idMarche}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Demande #{m.idDemande}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{m.nomService || m.roleDemandeur || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400 uppercase">Publié le {new Date(m.dateSelection).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{m.modePassation}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{Number(m.montantEstime).toLocaleString()} FBU</td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                      {m.dateCloture ? new Date(m.dateCloture).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.statut === 'cloture' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {m.statut}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleManage(m)}
                        className="text-primary hover:text-blue-800 font-bold text-xs flex items-center gap-1 justify-end ml-auto group"
                      >
                        <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CgmpMarches;

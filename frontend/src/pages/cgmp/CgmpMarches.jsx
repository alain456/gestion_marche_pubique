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
  LayoutGrid,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CgmpMarches = () => {
  const [marches, setMarches] = useState([]);
  const [groupedDemands, setGroupedDemands] = useState([]); // Nouveau nom pour plus de clarté
  const [expandedBudgets, setExpandedBudgets] = useState({}); // Pour déplier/replier les containers
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
      const pending = demandsRes.data.filter(d => d.statut === 'Valide' && !marchesRes.data.find(m => m.idDemande === d.idDemande));
      
      // Groupement par Budget (Container)
      const grouped = pending.reduce((acc, d) => {
        const bid = d.idBudget;
        if (!acc[bid]) {
          acc[bid] = {
            idBudget: bid,
            numeroBudget: d.numeroBudget,
            typeMarche: d.typeMarche,
            exerciceBudgetaire: d.exerciceBudgetaire,
            totalMontant: 0,
            demands: []
          };
        }
        acc[bid].demands.push(d);
        acc[bid].totalMontant += Number(d.montantEstime || 0);
        return acc;
      }, {});

      setGroupedDemands(Object.values(grouped));
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

  const toggleBudget = (idBudget) => {
    setExpandedBudgets(prev => ({ ...prev, [idBudget]: !prev[idBudget] }));
  };

  const handleCreateMarketForGroup = (group) => {
    setSelectedDemand(group.demands[0]); // Pour l'affichage dans le header
    const allIds = group.demands.map(d => d.idDemande).join(',');
    setForm(prev => ({ 
      ...prev, 
      idDemande: allIds,
      montantEstime: group.totalMontant || '' 
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
              <div className="mt-2 text-[10px] text-blue-100 uppercase font-bold">
                ID(s) Demande: {form.idDemande}
              </div>

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

      {/* Liste des demandes validées groupées par Budget (Containers) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutGrid className="text-primary h-6 w-6" />
          Demandes Validées par Container Budgétaire
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedDemands.length === 0 ? (
            <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
               Aucune demande validée en attente de traitement.
            </div>
          ) : (
            groupedDemands.map(group => (
              <div key={group.idBudget} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        {group.demands.length} Demande{group.demands.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {group.numeroBudget || 'Budget Inconnu'}
                  </h3>
                  
                  <div className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase mb-4 ${
                    group.typeMarche === 'fourniture' ? 'bg-blue-100 text-blue-800' :
                    group.typeMarche === 'travaux' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {group.typeMarche}
                  </div>

                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Montant Total Estimé</p>
                    <p className="text-xl font-black text-primary">{Number(group.totalMontant).toLocaleString()} FBU</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-4">
                    <span>Exercice {group.exerciceBudgetaire || '2026'}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCreateMarketForGroup(group)}
                        className="flex items-center gap-1 text-emerald-600 font-bold hover:underline text-[10px]"
                      >
                        <PlusCircle className="h-4 w-4" /> GÉRER LE MARCHÉ
                      </button>
                      <button 
                        onClick={() => toggleBudget(group.idBudget)}
                        className="flex items-center gap-1 text-primary font-bold hover:underline"
                      >
                        {expandedBudgets[group.idBudget] ? 'Cacher' : 'Voir'}
                        {expandedBudgets[group.idBudget] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails des demandes acceptées */}
                {expandedBudgets[group.idBudget] && (
                  <div className="bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                    {group.demands.map(d => (
                      <div key={d.idDemande} className="p-4 border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID Demande:</span>
                            <span className="ml-1 text-sm font-mono font-bold">#{d.idDemande}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            VALIDE
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                          <div>
                            <p className="text-gray-400 uppercase font-bold text-[9px]">Montant Estimé</p>
                            <p className="font-bold text-primary">{Number(d.montantEstime || 0).toLocaleString()} FBU</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 uppercase font-bold text-[9px]">Validé le</p>
                            <p className="font-semibold text-gray-700">{d.dateValidation ? new Date(d.dateValidation).toLocaleDateString() : new Date(d.dateDemande).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 uppercase font-bold text-[9px]">Resp. Financier</p>
                            <p className="font-semibold text-gray-700">{d.responsableFinancier || 'RAF'}</p>
                          </div>
                        </div>

                        {/* Liste des articles avec descriptions */}
                        <div className="mt-3 space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Articles & Spécifications</p>
                          {d.articles && d.articles.map((art, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-700">{art.nomArticle} (x{art.quantite})</span>
                                <span className="text-[10px] font-bold text-primary">{Number(art.prixUnitaire * art.quantite).toLocaleString()} FBU</span>
                              </div>
                              {art.description && (
                                <p className="text-[10px] text-gray-500 italic leading-tight">
                                  Spec: {art.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        {d.motif && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-gray-100 text-[10px] text-gray-500 italic">
                            Note RAF: {d.motif}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

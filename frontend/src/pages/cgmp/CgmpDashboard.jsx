import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Package
} from 'lucide-react'

const CgmpDashboard = () => {
  const [stats, setStats] = useState({
    pendingMarkets: 0,
    activeMarkets: 0,
    totalMarches: 0,
    totalArticles: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [marches, demands, articles] = await Promise.all([
          api.get('/marches'),
          api.get('/demandes'),
          api.get('/articles')
        ]);
        
        // Calcul des stats réelles
        const pending = demands.data.filter(d => 
          d.statut === 'Valide' && 
          !marches.data.find(m => String(m.idDemande).includes(String(d.idDemande)))
        ).length;

        setStats({
          pendingMarkets: pending,
          activeMarkets: marches.data.filter(m => m.statut === 'publie').length,
          totalMarches: marches.data.length,
          totalArticles: articles.data.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Demandes à Traiter', 
      value: stats.pendingMarkets, 
      icon: AlertCircle, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100',
      description: 'Budgets validés par le RAF'
    },
    { 
      title: 'Appels d\'Offres Actifs', 
      value: stats.activeMarkets, 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      description: 'En attente de soumissions'
    },
    { 
      title: 'Total des Marchés', 
      value: stats.totalMarches, 
      icon: FileText, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      description: 'Historique complet'
    },
    { 
      title: 'Articles au Catalogue', 
      value: stats.totalArticles, 
      icon: Package, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100',
      description: 'Articles référencés'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 animate-pulse">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord,CGMP</h1>
        <p className="text-gray-500 mt-2 text-lg">Bienvenue ! Gérez les appels d&apos;offres et les marchés publics ici.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2 group-hover:scale-110 transition-transform origin-left">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <section className="bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckSquare className="text-primary" />
            Actions Prioritaires
          </h2>
          <div className="space-y-4">
            <div 
              onClick={() => navigate('/cgmp/marches')}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-800">Publier les nouveaux marchés</p>
                  <p className="text-xs text-gray-500">{stats.pendingMarkets} demande(s) en attente de publication</p>
                </div>
              </div>
              <TrendingUp className="text-gray-300 group-hover:text-primary" size={20} />
            </div>
            <div 
              onClick={() => navigate('/cgmp/marches')}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-800">Analyser les offres reçues</p>
                  <p className="text-xs text-gray-500">Vérifier la conformité technique</p>
                </div>
              </div>
              <TrendingUp className="text-gray-300 group-hover:text-primary" size={20} />
            </div>
            <div 
              className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer" 
              onClick={() => navigate('/cgmp/budgets')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-800">Gérer les Budgets</p>
                  <p className="text-xs text-gray-500">Créer des numéros de regroupement par type</p>
                </div>
              </div>
              <TrendingUp className="text-gray-300 group-hover:text-primary" size={20} />
            </div>
          </div>
        </section>

        <section className="bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} />
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-2">Guide Rapide CGMP</h2>
           <p className="text-gray-500 mb-6">Processus de création d&apos;un marché public.</p>
           <ul className="space-y-4 text-sm text-gray-600">
             <li className="flex gap-3">
               <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
               <span>Sélectionnez une demande validée par le budget.</span>
             </li>
             <li className="flex gap-3">
               <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
               <span>Définissez le mode de passation (Appel d&apos;offre, Gré à gré, etc.).</span>
             </li>
             <li className="flex gap-3">
               <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
               <span>Rédigez la justification et fixez la date de clôture.</span>
             </li>
             <li className="flex gap-3">
               <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
               <span>Publiez le marché pour recevoir des soumissions.</span>
             </li>
           </ul>
        </section>
      </div>
    </div>
  );
};

export default CgmpDashboard;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Home, 
  FileText, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';

const ReceptionDashboard = () => {
  const [stats, setStats] = useState({
    activeMarkets: 0,
    totalOffersToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [marchesRes] = await Promise.all([
          api.get('/marches')
        ]);
        
        setStats({
          activeMarkets: marchesRes.data.filter(m => m.statut === 'publie').length,
          totalOffersToday: 0 // Mock for now
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Chargement...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord — Réception</h1>
        <p className="text-gray-500 mt-2">Bienvenue ! Gérez la réception des offres ici.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Marchés Ouverts</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.activeMarkets}</h3>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Offres Reçues Aujourd&apos;hui</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.totalOffersToday}</h3>
            </div>
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;

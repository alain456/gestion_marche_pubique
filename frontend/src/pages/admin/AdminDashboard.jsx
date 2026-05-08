import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Activity } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeRoles: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/users'),
          api.get('/users/roles'),
        ]);
        setStats({
          totalUsers: usersRes.data.length,
          activeRoles: rolesRes.data.length,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques admin:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600 mt-2">Turabire hamwe des utilisateurs, rôles et actions rapides.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-primary rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Utilisateurs Totaux</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-accent rounded-lg">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rôles Actifs</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.activeRoles}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Statut Système</p>
            <p className="text-2xl font-semibold text-gray-900">En ligne1</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition"
          >
            Ajouter un utilisateur
          </Link>
          <Link
            to="/admin/roles"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Gérer les rôles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

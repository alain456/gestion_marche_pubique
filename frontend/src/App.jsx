import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminServices from './pages/admin/AdminServices';
import AdminArticles from './pages/admin/AdminArticles';
import AdminSeuils from './pages/admin/AdminSeuils';
import DemandeurDashboard from './pages/demandeur/DemandeurDashboard';
import DemandeurDemandes from './pages/demandeur/DemandeurDemandes';
import RafDashboard from './pages/raf/RafDashboard';
import RafBudgets from './pages/raf/RafBudgets';

import ChefDashboard from './pages/chef/ChefDashboard';
import CgmpDashboard from './pages/cgmp/CgmpDashboard';
import CgmpMarches from './pages/cgmp/CgmpMarches';
import CgmpBudgets from './pages/cgmp/CgmpBudgets';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import ReceptionSoumissions from './pages/reception/ReceptionSoumissions';
import CgmpSoumissions from './pages/cgmp/CgmpSoumissions';
import AdminUserPermissions from './pages/admin/AdminUserPermissions';
import AdminPermissions from './pages/admin/AdminPermissions';
const Unauthorized = () => <div className="p-8 text-red-600 font-bold">Accès non autorisé</div>;

// Composant pour rediriger l'utilisateur vers son dashboard par défaut
const RootRedirect = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  // Normalisation du rôle : tout en majuscules et remplacement des espaces par des underscores
  const role = user.role.toUpperCase().replace(/\s+/g, '_');

  switch (role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'DEMANDEUR':
      return <Navigate to="/demandeur" replace />;
    case 'CHEF_SERVICE':
      return <Navigate to="/demandeur" replace />;
    case 'CHEF_INSTITUTION':
      return <Navigate to="/chef" replace />;
    case 'RAF':
      return <Navigate to="/raf" replace />;
    case 'CGMP':
      return <Navigate to="/cgmp" replace />;
    case 'RECEPTIONISTE':
    case 'RECEPTIONNISTE':
      return <Navigate to="/reception" replace />;
    default:
      console.warn("Rôle non reconnu:", role);
      return <Navigate to="/unauthorized" replace />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Dashboard - Seulement pour le rôle ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/seuils" element={<AdminSeuils />} />
          </Route>

          {/* Utilisateurs - Permission requise */}
          <Route element={<ProtectedRoute requiredPermission={['GERER_UTILISATEURS', 'VOIR_UTILISATEURS']} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Rôles - Permission requise */}
          <Route element={<ProtectedRoute requiredPermission="GERER_ROLES_PERMISSIONS" />}>
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/permissions" element={<AdminPermissions />} />
          </Route>

          {/* Attribution des permissions — réservé à l'administrateur */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/user-permissions" element={<AdminUserPermissions />} />
          </Route>

          {/* Services - Permission requise */}
          <Route element={<ProtectedRoute requiredPermission="GERER_SERVICES" />}>
            <Route path="/admin/services" element={<AdminServices />} />
          </Route>

          {/* Articles - Permission requise */}
          <Route element={<ProtectedRoute requiredPermission="GERER_ARTICLES" />}>
            <Route path="/admin/articles" element={<AdminArticles />} />
          </Route>

          {/* === Dashboards (Basés sur les Rôles) === */}
          <Route element={<ProtectedRoute allowedRoles={['CHEF_INSTITUTION', 'CHEF_SERVICE']} requiredPermission="VOIR_STATISTIQUES" />}>
            <Route path="/chef" element={<ChefDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RAF']} />}>
            <Route path="/raf" element={<RafDashboard />} />
            <Route path="/raf/demandes-systeme" element={<RafDashboard />} />
            <Route path="/raf/mes-demandes" element={<RafDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['CGMP']} />}>
            <Route path="/cgmp" element={<CgmpDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RECEPTIONISTE', 'RECEPTIONNISTE']} />}>
            <Route path="/reception" element={<ReceptionDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['DEMANDEUR', 'CHEF_SERVICE', 'CHEF_INSTITUTION', 'RAF', 'ADMIN']} />}>
            <Route path="/demandeur" element={<DemandeurDashboard />} />
          </Route>

          {/* === Pages Fonctionnelles (Basées sur les Permissions) === */}
          <Route element={<ProtectedRoute requiredPermission={['VALIDER_BUDGET_DEMANDE', 'VOIR_BUDGETS', 'GERER_BUDGETS']} />}>
            <Route path="/raf/budgets" element={<RafBudgets />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={['VOIR_MARCHES', 'GERER_MARCHES']} />}>
            <Route path="/cgmp/marches" element={<CgmpMarches />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={['AJUSTER_DEMANDE_CGMP', 'VOIR_TOUTES_DEMANDES']} />}>
            <Route path="/cgmp/budgets" element={<CgmpBudgets />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={['VOIR_MARCHES', 'GERER_SOUMISSIONS']} allowedRoles={['CGMP']} />}>
            <Route path="/cgmp/soumissionnaires" element={<CgmpSoumissions />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RECEPTIONISTE', 'RECEPTIONNISTE']} />}>
            <Route path="/reception/soumissions" element={<ReceptionSoumissions />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission={['CREER_DEMANDE', 'DEMANDE_CREATE', 'VOIR_MES_DEMANDES', 'DEMANDE_READ_OWN', 'VOIR_TOUTES_DEMANDES', 'DEMANDE_READ_ALL']} />}>
            <Route path="/demandeur/demandes" element={<DemandeurDemandes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

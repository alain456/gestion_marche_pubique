import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Settings, 
  Users, 
  CreditCard,
  CheckSquare,
  Building2,
  Gavel
} from 'lucide-react';
import PropTypes from 'prop-types';

const Sidebar = ({ user }) => {
  const role = user?.role?.toUpperCase().replace(/\s+/g, '_') || '';

  const getLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: Home },
          { name: 'Utilisateurs', path: '/admin/users', icon: Users },
          { name: 'Rôles', path: '/admin/roles', icon: Settings },
          { name: 'Services', path: '/admin/services', icon: Building2 },
          { name: 'Articles', path: '/admin/articles', icon: FileText },
        ];
      case 'CHEF_SERVICE':
        return [
          { name: 'Dashboard', path: '/demandeur', icon: Home },
          { name: 'Mes Demandes', path: '/demandeur/demandes', icon: FileText },
        ];
      case 'CHEF_INSTITUTION':
        return [
          { name: 'Dashboard', path: '/chef', icon: Home },
          { name: 'Suivi Stratégique', path: '/chef', icon: Gavel },
          { name: 'Mes Demandes', path: '/demandeur/demandes', icon: FileText },
        ];
      case 'RAF':
        return [
          { name: 'Dashboard', path: '/raf', icon: Home },
          { name: 'Validation Budget', path: '/raf/budgets', icon: CheckSquare },
          { name: 'Paiements', path: '/raf/paiements', icon: CreditCard },
        ];
      case 'CGMP':
        return [
          { name: 'Dashboard', path: '/cgmp', icon: Home },
          { name: 'Mes Commandes d\'Achat', path: '/cgmp/budgets', icon: CreditCard },
          { name: 'Marchés', path: '/cgmp/marches', icon: FileText },
        ];
      case 'RECEPTIONNISTE':
        return [
          { name: 'Dashboard', path: '/reception', icon: Home },
          { name: 'Enregistrement Offres', path: '/reception/soumissions', icon: FileText },
        ];
      case 'DEMANDEUR':
        return [
          { name: 'Dashboard', path: '/demandeur', icon: Home },
          { name: 'Mes Demandes', path: '/demandeur/demandes', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="bg-primary w-64 shrink-0 flex flex-col text-white">
      <div className="h-16 flex items-center justify-center border-b border-blue-800">
        <h1 className="text-2xl font-bold tracking-wider text-accent">SETIC</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={`${link.path}-${link.name}`}>
                <NavLink
                  to={link.path}
                  end={link.path.split('/').length === 2}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-800 text-accent font-medium'
                        : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string
  })
};

export default Sidebar;

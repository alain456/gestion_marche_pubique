import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Menu, User, X } from 'lucide-react';
import PropTypes from 'prop-types';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ isMenuOpen, onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="app-navbar bg-surface h-16 flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-gray-200">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMenuToggle}
          className="app-menu-toggle mr-3 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
          aria-controls="app-navigation"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h2 className="text-xl font-semibold text-primary hidden md:block">Système de Gestion des Marchés Publics</h2>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationCenter user={user} />
        <div className="flex flex-col items-end mr-2">
          <div className="flex items-center space-x-2 text-gray-800">
            <span className="font-bold text-sm">{user?.nom || 'Utilisateur'}</span>
            <User className="h-4 w-4 text-gray-400" />
          </div>
          {user?.nomService && (
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              {user.nomService}
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  isMenuOpen: PropTypes.bool,
  onMenuToggle: PropTypes.func
};

export default Navbar;

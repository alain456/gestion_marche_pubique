import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-gray-200">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-primary hidden md:block">Système de Gestion des Marchés Publics</h2>
      </div>
      <div className="flex items-center space-x-4">
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
          className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;

import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center text-primary">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalisation du rôle pour la comparaison (espaces -> underscores)
  const userRole = user.role.toUpperCase().replace(/\s+/g, '_');

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary p-4 md:p-8 lg:px-12 lg:py-10">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;

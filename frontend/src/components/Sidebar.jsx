import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  CreditCard,
  CheckSquare,
  Building2,
  Gavel,
  ClipboardList,
  Shield,
  UserCog
} from 'lucide-react';
import PropTypes from 'prop-types';

const Sidebar = ({ user }) => {
  const role = user?.role?.toUpperCase().replace(/\s+/g, '_') || '';
  const permissions = user?.permissions || [];

  const has = (code) => permissions.includes(code);
  const canReadOwnDemandes = has('VOIR_MES_DEMANDES') || has('DEMANDE_READ_OWN');
  const canReadAllDemandes = has('VOIR_TOUTES_DEMANDES') || has('DEMANDE_READ_ALL');
  const canCreateDemande = has('CREER_DEMANDE') || has('DEMANDE_CREATE');

  const buildLinks = () => {
    const links = [];

    // Dashboard selon le rôle
    if (role === 'ADMIN') links.push({ name: 'Dashboard', path: '/admin', icon: Home });
    else if (role === 'RAF') links.push({ name: 'Dashboard', path: '/raf', icon: Home });
    else if (role === 'CGMP') links.push({ name: 'Dashboard', path: '/cgmp', icon: Home });
    else if (role === 'CHEF_INSTITUTION') links.push({ name: 'Dashboard', path: '/chef', icon: Home });
    else if (role === 'RECEPTIONISTE' || role === 'RECEPTIONNISTE') links.push({ name: 'Dashboard', path: '/reception', icon: Home });
    else links.push({ name: 'Dashboard', path: '/demandeur', icon: Home });

    // Liens selon les permissions
    if (role === 'RAF') {
      if (canReadAllDemandes || has('VALIDER_BUDGET_DEMANDE')) {
        links.push({ name: 'Demandes système', path: '/raf/demandes-systeme', icon: FileText });
      }
      if (canCreateDemande || canReadOwnDemandes) {
        links.push({ name: 'Mes demandes', path: '/raf/mes-demandes', icon: FileText });
      }
    } else if (canCreateDemande || canReadOwnDemandes || canReadAllDemandes) {
      links.push({ name: 'Demandes', path: '/demandeur/demandes', icon: FileText });
    }
    if (has('VALIDER_BUDGET_DEMANDE') || has('VOIR_BUDGETS') || has('GERER_BUDGETS')) {
      links.push({ name: 'Validation Budget', path: '/raf/budgets', icon: CheckSquare });
    }
    // Le module paiements est dans l'écran /raf (onglet), pas une route /raf/paiements
    if ((has('EFFECTUER_PAIEMENT') || has('VOIR_PAIEMENTS')) && has('VOIR_RECEPTIONS')) {
      links.push({ name: 'Paiements', path: '/raf', icon: CreditCard });
    }
    if ((has('VOIR_MARCHES') || has('GERER_MARCHES')) && role !== 'RECEPTIONISTE' && role !== 'RECEPTIONNISTE') {
      links.push({ name: 'Marchés', path: '/cgmp/marches', icon: FileText });
      links.push({ name: 'Paramétrage Seuils', path: '/cgmp/seuils', icon: Gavel });
    }
    if (has('AJUSTER_DEMANDE_CGMP')) {
      links.push({ name: 'Lignes Budgétaires', path: '/cgmp/budgets', icon: CreditCard });
    }
    if (role === 'CGMP' && (has('VOIR_MARCHES') || has('GERER_SOUMISSIONS'))) {
      links.push({ name: 'Soumissionnaires', path: '/cgmp/soumissionnaires', icon: ClipboardList });
    }
    if ((role === 'RECEPTIONISTE' || role === 'RECEPTIONNISTE') && has('ENREGISTRER_EXECUTION')) {
      links.push({ name: 'Enregistrement Offres', path: '/reception/soumissions', icon: FileText });
    }
    if (has('GERER_UTILISATEURS') || has('VOIR_UTILISATEURS')) {
      links.push({ name: 'Utilisateurs', path: '/admin/users', icon: Users });
    }
    // Attribution des permissions : réservé au rôle ADMIN (même si l’admin n’a pas GERER_ROLES_PERMISSIONS)
    if (role === 'ADMIN' || has('GERER_UTILISATEURS')) {
      links.push({ name: 'Attribuer permissions', path: '/admin/user-permissions', icon: UserCog });
    }
    if (has('GERER_ROLES_PERMISSIONS')) {
      links.push({ name: 'Rôles & Permissions', path: '/admin/roles', icon: Shield });
      links.push({ name: 'Permissions', path: '/admin/permissions', icon: Shield });
    }
    if (has('GERER_SERVICES')) {
      links.push({ name: 'Services', path: '/admin/services', icon: Building2 });
    }
    if (has('GERER_ARTICLES')) {
      links.push({ name: 'Articles', path: '/admin/articles', icon: FileText });
    }
    if (has('VOIR_STATISTIQUES') && role === 'CHEF_INSTITUTION') {
      links.push({ name: 'Suivi Stratégique', path: '/chef', icon: Gavel });
    }

    // Dédupliquer par path
    const seen = new Set();
    return links.filter(l => {
      if (seen.has(l.path)) return false;
      seen.add(l.path);
      return true;
    });
  };

  const links = buildLinks();

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
    role: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string)
  })
};

export default Sidebar;

/**
 * Retourne un label lisible pour la source d'une demande.
 * Priorité : nomService (si renseigné) > mapping du rôle > roleDemandeur brut
 *
 * @param {object} d - objet demande (doit avoir roleDemandeur et nomService)
 * @returns {string} label affiché dans les dashboards
 */
export const getServiceOrRoleLabel = (d) => {
  if (!d) return 'Inconnu';

  // 1. Si le service formel existe en base, on l'affiche en priorité
  if (d.nomService) return d.nomService;

  const role = d.roleDemandeur?.toLowerCase()?.trim() || '';

  // 2. Mapping des rôles sans service formel
  if (role === 'receptioniste' || role === 'receptionniste') return 'Réceptionniste';
  if (role === 'raf') return 'RAF';
  if (role === 'admin') return 'Administrateur';
  if (role === 'cgmp') return 'CGMP';
  if (role === 'chef_institution' || role === 'chef institution') return 'Direction Générale';
  if (role === 'chef service' || role === 'chef_service') return 'Chef de Service';
  if (role === 'maintenance') return 'Maintenance';

  // 3. Fallback : afficher le rôle tel quel (jamais "Service Inconnu")
  return d.roleDemandeur || 'Inconnu';
};

/** Canal pour notifier les autres onglets qu'un utilisateur a reçu de nouveaux droits */
export const PERMISSIONS_CHANNEL = 'setic-permissions';

export const notifyPermissionsUpdated = (idUser) => {
  if (typeof BroadcastChannel === 'undefined' || !idUser) return;
  const channel = new BroadcastChannel(PERMISSIONS_CHANNEL);
  channel.postMessage({ type: 'UPDATED', idUser });
  channel.close();
};

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../services/api';
import PropTypes from 'prop-types';

const formatDate = (date) => new Date(date).toLocaleString('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short'
});

const NotificationCenter = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
      setError('');
    } catch (loadError) {
      console.error('Erreur lors du chargement des notifications:', loadError);
      setError('Les notifications ne sont pas disponibles.');
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadNotifications();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!panelRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const routeForRole = () => {
    const role = user?.role?.toUpperCase().replace(/\s+/g, '_');
    if (role === 'ADMIN') return '/admin';
    if (role === 'RAF') return '/raf/demandes-systeme';
    if (role === 'CGMP') return '/cgmp';
    if (role === 'CHEF_INSTITUTION') return '/chef';
    if (role === 'RECEPTIONISTE' || role === 'RECEPTIONNISTE') return '/reception';
    return '/demandeur/demandes';
  };

  const openNotification = async (notification) => {
    setError('');
    try {
      if (!notification.lu) {
        await api.patch(`/notifications/${notification.idHistorique}/read`);
        setNotifications(current => current.map(item =>
          item.idHistorique === notification.idHistorique ? { ...item, lu: true } : item
        ));
        setUnreadCount(count => Math.max(0, count - 1));
      }
      setIsOpen(false);
      navigate(routeForRole(), { state: { demandeId: notification.idDemande } });
    } catch (markError) {
      console.error('Erreur lors de la mise à jour de la notification:', markError);
      setError('Impossible de marquer cette notification comme lue.');
    }
  };

  const markAllAsRead = async () => {
    setError('');
    try {
      await api.patch('/notifications/read-all');
      setNotifications(current => current.map(item => ({ ...item, lu: true })));
      setUnreadCount(0);
    } catch (markError) {
      console.error('Erreur lors de la mise à jour des notifications:', markError);
      setError('Impossible de marquer les notifications comme lues.');
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-blue-50 hover:text-primary"
        aria-label={unreadCount ? `Notifications, ${unreadCount} non lues` : 'Notifications'}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-5 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="notification-panel"
          aria-label="Centre de notifications"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Tout lire
            </button>
          </div>
          {error && (
            <p role="alert" className="px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          <ul className="max-h-[min(24rem,65vh)] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                Aucune notification récente.
              </li>
            ) : notifications.map(notification => (
              <li key={notification.idHistorique}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 ${
                    notification.lu ? 'bg-white' : 'bg-blue-50/60'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.lu ? 'bg-slate-300' : 'bg-blue-600'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        Demande #{notification.idDemande} · {notification.action}
                      </span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {notification.nomUtilisateur || 'Utilisateur'} · {notification.roleUtilisateur || 'Système'}
                        {notification.nouveauStatut ? ` · ${notification.nouveauStatut}` : ''}
                      </span>
                      <time className="mt-1 block text-[11px] text-slate-400" dateTime={notification.dateAction}>
                        {formatDate(notification.dateAction)}
                      </time>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

NotificationCenter.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string
  })
};

export default NotificationCenter;

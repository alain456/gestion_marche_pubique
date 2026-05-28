import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { PERMISSIONS_CHANNEL } from '../utils/permissionsSync';

export const AuthContext = createContext();

const PERMISSIONS_POLL_MS = 8000;

const permissionsChanged = (prev, next) => {
  if (!prev || !next) return true;
  const a = [...(prev.permissions || [])].sort().join(',');
  const b = [...(next.permissions || [])].sort().join(',');
  return a !== b;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const applySessionUser = useCallback((sessionUser) => {
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/auth/session');
      const sessionUser = response.data.user;
      if (permissionsChanged(userRef.current, sessionUser)) {
        applySessionUser(sessionUser);
      }
    } catch (error) {
      // 401 = token expiré / invalide
      // 403 sur /auth/session = compte désactivé (ou plus autorisé) → déconnecter
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, [applySessionUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    const init = async () => {
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          await refreshSession();
        } catch (e) {
          console.error('Erreur parsing user', e);
        }
      }
      setLoading(false);
    };

    init();
  }, [refreshSession]);

  // Polling + retour sur l'onglet : droits à jour sans reconnexion
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(refreshSession, PERMISSIONS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    const channel = new BroadcastChannel(PERMISSIONS_CHANNEL);
    channel.onmessage = (event) => {
      const { type, idUser } = event.data || {};
      if (type === 'UPDATED' && idUser === userRef.current?.idUser) {
        refreshSession();
      }
    };

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      channel.close();
    };
  }, [user, refreshSession]);

  const login = async (email, mot_de_passe) => {
    try {
      const response = await api.post('/auth/login', { email, password: mot_de_passe });
      const { token, user: loggedUser } = response.data;

      localStorage.setItem('token', token);
      applySessionUser(loggedUser);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur de connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permissionCode) => {
    return user && user.permissions && user.permissions.includes(permissionCode);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, refreshSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

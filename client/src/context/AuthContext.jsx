import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState({ points: 0, streak_days: 0, rank_title: 'Practitioner' });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      try {
        const storedToken = localStorage.getItem('strata_token');
        const storedUser = localStorage.getItem('strata_user');
        
        if (storedToken && storedUser) {
          try {
            const res = await apiRequest('/auth/me');
            setUser(res.user);
            setGamification(res.gamification);
            setUnreadCount(res.unreadNotificationsCount || 0);
          } catch {
            // Token expired or invalid
            localStorage.removeItem('strata_token');
            localStorage.removeItem('strata_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Session restoration note:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('strata_token', data.token);
    localStorage.setItem('strata_user', JSON.stringify(data.user));
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('strata_token', data.token);
    localStorage.setItem('strata_user', JSON.stringify(data.user));
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const switchRole = async (role) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      localStorage.setItem('strata_token', data.token);
      localStorage.setItem('strata_user', JSON.stringify(data.user));
      setUser(data.user);
      await refreshUser();
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  };

  const resetPassword = async (token, newPassword) => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  };

  const logout = () => {
    localStorage.removeItem('strata_token');
    localStorage.removeItem('strata_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      setUser(res.user);
      setGamification(res.gamification);
      setUnreadCount(res.unreadNotificationsCount || 0);
    } catch {}
  };

  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permissionCode) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        gamification,
        unreadCount,
        loading,
        login,
        register,
        switchRole,
        forgotPassword,
        resetPassword,
        logout,
        hasPermission,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

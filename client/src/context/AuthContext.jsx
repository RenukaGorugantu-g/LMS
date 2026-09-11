import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'superadmin@stratalms.com': {
    id: 'usr-superadmin',
    email: 'superadmin@stratalms.com',
    name: 'Marcus Vance',
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'SUPER_ADMIN',
    title: 'Chief Learning Officer & Super Admin',
    department: 'Executive Governance',
    org_id: 'org-acme',
    org_name: 'MapleLMS Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: ['course.create', 'course.read', 'course.update', 'course.delete', 'course.publish', 'scorm.upload', 'scorm.manage', 'learner.read', 'analytics.org', 'analytics.course', 'analytics.team', 'audit.read', 'org.manage', 'ai.course.create', 'ai.content.generate', 'ai.assessment.generate', 'assignment.grade']
  },
  'admin@acmeglobal.com': {
    id: 'usr-admin',
    email: 'admin@acmeglobal.com',
    name: 'Sarah Jenkins',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    role: 'ADMIN',
    title: 'VP of People & Talent Development',
    department: 'People Operations',
    org_id: 'org-acme',
    org_name: 'MapleLMS Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    permissions: ['course.create', 'course.read', 'course.update', 'course.delete', 'course.publish', 'scorm.upload', 'scorm.manage', 'learner.read', 'analytics.org', 'analytics.course', 'analytics.team', 'org.manage', 'ai.course.create', 'ai.content.generate', 'ai.assessment.generate', 'assignment.grade']
  },
  'creator@acmeglobal.com': {
    id: 'usr-creator',
    email: 'creator@acmeglobal.com',
    name: 'David Chen',
    first_name: 'David',
    last_name: 'Chen',
    role: 'COURSE_CREATOR',
    title: 'Lead Curriculum Designer & Instructor',
    department: 'Learning Design',
    org_id: 'org-acme',
    org_name: 'MapleLMS Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    permissions: ['course.create', 'course.read', 'course.update', 'course.publish', 'lesson.create', 'lesson.update', 'lesson.delete', 'scorm.upload', 'scorm.manage', 'learner.read', 'analytics.course', 'analytics.team', 'ai.course.create', 'ai.content.generate', 'ai.assessment.generate', 'assignment.grade']
  },
  'elena.rostova@acmeglobal.com': {
    id: 'usr-learner',
    email: 'elena.rostova@acmeglobal.com',
    name: 'Elena Rostova',
    first_name: 'Elena',
    last_name: 'Rostova',
    role: 'LEARNER',
    title: 'Senior Cloud & Security Systems Engineer',
    department: 'Security & Cloud',
    org_id: 'org-acme',
    org_name: 'MapleLMS Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: ['course.read']
  }
};

const ROLE_TO_DEMO = {
  'SUPER_ADMIN': DEMO_USERS['superadmin@stratalms.com'],
  'ADMIN': DEMO_USERS['admin@acmeglobal.com'],
  'COURSE_CREATOR': DEMO_USERS['creator@acmeglobal.com'],
  'LEARNER': DEMO_USERS['elena.rostova@acmeglobal.com']
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState({ points: 2450, streak_days: 12, rank_title: 'Senior Specialist' });
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
          } catch (apiErr) {
            // If 404 or backend unavailable on Vercel, restore from localStorage
            try {
              const parsed = JSON.parse(storedUser);
              setUser(parsed);
            } catch {
              localStorage.removeItem('strata_token');
              localStorage.removeItem('strata_user');
              setUser(null);
            }
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
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('strata_token', data.token);
      localStorage.setItem('strata_user', JSON.stringify(data.user));
      setUser(data.user);
      await refreshUser();
      return data.user;
    } catch (err) {
      // If endpoint returned 404 or failed on Vercel
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Failed to fetch') || err.status === 404)) {
        const cleanEmail = email?.toLowerCase().trim();

        // 1. Check Demo Accounts
        if (DEMO_USERS[cleanEmail] && (password === 'password123' || !password)) {
          const matched = DEMO_USERS[cleanEmail];
          const token = 'demo-token-' + matched.role.toLowerCase() + '-' + Date.now();
          localStorage.setItem('strata_token', token);
          localStorage.setItem('strata_user', JSON.stringify(matched));
          setUser(matched);
          setGamification({ points: 2450, streak_days: 12, rank_title: 'Senior Specialist' });
          return matched;
        }

        // 2. Direct Supabase Cloud Authentication
        try {
          const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (!sbError && sbData?.user) {
            const role = sbData.user.user_metadata?.role || 'COURSE_CREATOR';
            const fName = sbData.user.user_metadata?.first_name || sbData.user.user_metadata?.full_name?.split(' ')[0] || 'Enterprise';
            const lName = sbData.user.user_metadata?.last_name || sbData.user.user_metadata?.full_name?.split(' ')[1] || 'User';
            const sbUser = {
              id: sbData.user.id,
              email: sbData.user.email,
              name: `${fName} ${lName}`,
              first_name: fName,
              last_name: lName,
              role,
              org_id: 'org-acme',
              org_name: 'MapleLMS Enterprise',
              title: role === 'COURSE_CREATOR' ? 'Lead Curriculum Designer' : 'Enterprise Specialist',
              department: 'Engineering & Product',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              permissions: ROLE_TO_DEMO[role]?.permissions || ['course.read']
            };
            const token = sbData.session?.access_token || 'supabase-token-' + Date.now();
            localStorage.setItem('strata_token', token);
            localStorage.setItem('strata_user', JSON.stringify(sbUser));
            setUser(sbUser);
            setGamification({ points: 100, streak_days: 1, rank_title: 'Apprentice' });
            return sbUser;
          }
        } catch (sbEx) {
          console.warn('Supabase direct auth note:', sbEx);
        }

        throw new Error('Invalid enterprise credentials. Please check your email and password.');
      }
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      localStorage.setItem('strata_token', data.token);
      localStorage.setItem('strata_user', JSON.stringify(data.user));
      setUser(data.user);
      await refreshUser();
      return data.user;
    } catch (err) {
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Failed to fetch') || err.status === 404)) {
        // Direct Supabase Cloud Registration
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role,
              org_name: userData.orgName
            }
          }
        });

        if (sbError) throw new Error(sbError.message);

        const newUser = {
          id: sbData.user?.id || 'usr-' + Date.now(),
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
          first_name: userData.firstName,
          last_name: userData.lastName || 'User',
          role: userData.role || 'COURSE_CREATOR',
          org_id: 'org-acme',
          org_name: userData.orgName || 'MapleLMS Enterprise',
          title: userData.role === 'COURSE_CREATOR' ? 'Lead Curriculum Designer' : 'Learner',
          department: 'Engineering & Product',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          permissions: ROLE_TO_DEMO[userData.role]?.permissions || ['course.read']
        };

        const token = sbData.session?.access_token || 'supabase-token-' + Date.now();
        localStorage.setItem('strata_token', token);
        localStorage.setItem('strata_user', JSON.stringify(newUser));
        setUser(newUser);
        setGamification({ points: 100, streak_days: 1, rank_title: 'Apprentice' });
        return newUser;
      }
      throw err;
    }
  };

  const switchRole = async (role) => {
    setLoading(true);
    try {
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
      } catch (err) {
        if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Failed to fetch') || err.status === 404)) {
          const demoUser = ROLE_TO_DEMO[role] || ROLE_TO_DEMO['LEARNER'];
          const token = 'demo-token-' + role.toLowerCase() + '-' + Date.now();
          localStorage.setItem('strata_token', token);
          localStorage.setItem('strata_user', JSON.stringify(demoUser));
          setUser(demoUser);
          setGamification({ points: 2450, streak_days: 12, rank_title: 'Senior Specialist' });
          return demoUser;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch (err) {
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Failed to fetch') || err.status === 404)) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw new Error(error.message);
        return { success: true, message: 'Password recovery email sent via Supabase Cloud Auth.' };
      }
      throw err;
    }
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
    } catch (err) {
      // Retain active user state on 404
    }
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

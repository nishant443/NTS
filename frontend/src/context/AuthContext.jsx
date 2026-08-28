import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login: verify existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('nts_token') || sessionStorage.getItem('nts_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('nts_token');
        sessionStorage.removeItem('nts_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, rememberMe) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('nts_token', token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('nts_token');
    sessionStorage.removeItem('nts_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

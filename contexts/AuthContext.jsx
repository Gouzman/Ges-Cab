import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { api } from '@/lib/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await api.auth.validateToken(token);
      setUser(response.user);
      setLoading(false);
    } catch (error) {
      console.error('Erreur de validation du token:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // On supprime quand même le token en local en cas d'erreur
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
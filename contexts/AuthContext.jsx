import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/db';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // TODO: Implémenter la vérification du token avec le backend
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      // TODO: Ajouter la validation du token avec le backend
      setLoading(false);
    } catch (error) {
      console.error('Erreur de validation du token:', error);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // TODO: Implémenter l'authentification avec le backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Échec de l\'authentification');
      
      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return { user: data.user };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

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
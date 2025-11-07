import React, { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const SimpleAuthContext = createContext();

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email, password) => {
    setLoading(true);
    
    try {
      // Utiliser la bonne URL de l'API (port 3003)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';
      const response = await fetch(`${apiUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Convertir l'ID en string pour la compatibilité
        const user = { ...data.data };
        if (user.id) {
          user.id = String(user.id);
        }
        
        // Stocker les données utilisateur
        if (data.token) {
          localStorage.setItem('ges-cab-token', data.token);
        }
        localStorage.setItem('ges-cab-user', JSON.stringify(user));
        setUser(user);
        return { data: user, error: null };
      } else {
        throw new Error(data.error || 'Erreur de connexion inconnue');
      }
    } catch (error) {
      console.error('Erreur signIn:', error);
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Erreur de connexion';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Serveur injoignable, vérifiez que le backend est lancé sur le port 3003.';
      } else if (error.message.includes('HTTP 401')) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { data: null, error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('ges-cab-token');
    localStorage.removeItem('ges-cab-user');
    setUser(null);
  };

  // Vérifier la session au démarrage
  React.useEffect(() => {
    const storedUser = localStorage.getItem('ges-cab-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Convertir l'ID en string pour la compatibilité
        if (parsedUser && parsedUser.id) {
          parsedUser.id = String(parsedUser.id);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('ges-cab-user');
        localStorage.removeItem('ges-cab-token');
      }
    }
    setLoading(false);
  }, []);

  // Fonctions utilitaires pour compatibilité
  const hasRole = (role) => user?.role === role;
  const isAdmin = () => user?.role === 'admin' || user?.role === 'gerant';
  const hasFunction = (func) => user?.function === func || isAdmin();

  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    hasFunction,
    // Compatibilité avec l'ancien contexte
    auth: { user }
  }), [user, loading, hasRole, isAdmin, hasFunction]);

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

SimpleAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SimpleAuthProvider');
  }
  return context;
};
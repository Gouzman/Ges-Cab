import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from '@/components/ui/use-toast';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
  };
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Erreur de validation:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Identifiants invalides');
      }

      const { user, token } = await response.json();
      localStorage.setItem('auth_token', token);
      setUser(user);
      return { user };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
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
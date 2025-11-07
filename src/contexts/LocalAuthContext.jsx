import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const LocalAuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simuler la récupération de session depuis localStorage
  useEffect(() => {
    const checkSession = () => {
      const savedUser = localStorage.getItem('ges-cab-user');
      const savedSession = localStorage.getItem('ges-cab-session');
      
      if (savedUser && savedSession) {
        setUser(JSON.parse(savedUser));
        setSession(JSON.parse(savedSession));
      }
      
      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);

      // Appeler l'API backend pour vérifier les credentials
      const response = await fetch('http://localhost:3003/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur de connexion');
      }

      // Créer l'objet utilisateur et session
      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        function: result.data.function,
        role: result.data.role,
      };

      const sessionData = {
        access_token: `local-token-${Date.now()}`,
        user: userData,
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24h
      };

      // Sauvegarder dans localStorage
      localStorage.setItem('ges-cab-user', JSON.stringify(userData));
      localStorage.setItem('ges-cab-session', JSON.stringify(sessionData));

      setUser(userData);
      setSession(sessionData);

      toast({
        title: "👋 Bienvenue !",
        description: `Connexion réussie pour ${userData.name}`,
      });

      return { error: null };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      toast({
        variant: "destructive",
        title: "Connexion échouée",
        description: error.message,
      });

      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      // Nettoyer localStorage
      localStorage.removeItem('ges-cab-user');
      localStorage.removeItem('ges-cab-session');

      setUser(null);
      setSession(null);

      toast({
        title: "👋 À bientôt !",
        description: "Vous avez été déconnecté avec succès.",
      });

      return { error: null };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { error };
    }
  }, [toast]);

  // Fonction pour vérifier si un utilisateur existe
  const checkUserExists = useCallback(async (email) => {
    try {
      const response = await fetch(`http://localhost:3003/api/auth/check-user?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      
      return {
        exists: result.success && result.data.exists,
        error: result.error,
        hasPassword: result.data?.hasPassword || false,
        userId: result.data?.userId
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      return { exists: false, error: error.message, hasPassword: false };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signOut,
    checkUserExists,
    // Méthodes compatibles avec SupabaseAuth (stubs)
    signUp: async () => ({ error: new Error('Non implémenté') }),
    createAccount: async () => ({ error: new Error('Non implémenté') }),
    validateTempPassword: async () => ({ success: false, error: 'Non implémenté' }),
    completeFirstLogin: async () => ({ success: false, error: 'Non implémenté' }),
    resetPassword: async () => ({ success: false, error: 'Non implémenté' }),
    createUserByAdmin: async () => ({ success: false, error: 'Non implémenté' }),
    requestPasswordReset: async () => ({ success: false, error: 'Non implémenté' }),
    updatePasswordWithToken: async () => ({ success: false, error: 'Non implémenté' }),
  }), [user, session, loading, signIn, signOut, checkUserExists]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a LocalAuthProvider');
  }
  return context;
};
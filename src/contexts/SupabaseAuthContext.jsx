import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfileAndPermissions = useCallback(async (userId) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({ variant: "destructive", title: "Erreur de profil", description: "Impossible de charger les informations de l'utilisateur." });
        return null;
      }

      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .maybeSingle();

      if (permissionsError) {
        console.error("Error fetching permissions:", permissionsError);
      }

      return { ...profileData, permissions: permissionsData?.permissions || null };
    } catch (error) {
      console.error("Network or other error fetching user profile:", error);
      toast({ variant: "destructive", title: "Erreur Réseau", description: "Impossible de se connecter à la base de données pour récupérer le profil." });
      return null;
    }
  }, [toast]);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    if (session?.user) {
      const profile = await fetchUserProfileAndPermissions(session.user.id);
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [fetchUserProfileAndPermissions]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        handleSession(session);
      } catch (error) {
        console.error("Error getting session:", error);
        toast({ variant: "destructive", title: "Erreur de Session", description: "Impossible de vérifier la session utilisateur. Vérifiez votre connexion." });
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession, toast]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "L'inscription a échoué",
        description: error.message.includes('User already registered') 
          ? "Un utilisateur avec cet email existe déjà."
          : "Une erreur est survenue.",
      });
    }

    return { data, error };
  }, [toast]);

  const createAccount = useCallback(async (email, password) => {
    // Validation côté client
    if (!email || !password) {
      throw new Error("Email et mot de passe sont obligatoires");
    }

    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    try {
      // D'abord, vérifier que l'utilisateur existe dans la table profiles
      const { exists, userId } = await checkUserExists(email);
      
      if (!exists) {
        throw new Error("Vous devez être enregistré par l'administrateur.");
      }

      // Hacher le mot de passe
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Mettre à jour le hash du mot de passe dans la base
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ password_hash: hashedPassword })
        .eq('id', userId);

      if (updateError) {
        throw new Error("Erreur lors de la mise à jour du mot de passe");
      }

      // Créer l'utilisateur dans Supabase Auth pour la session
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Pas de confirmation d'email
        }
      });

      if (error && !error.message.includes('User already registered')) {
        throw new Error(error.message || "Erreur lors de la création du compte");
      }

      // Connecter automatiquement l'utilisateur
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error("Erreur lors de la connexion automatique");
      }

      toast({
        title: "🎉 Compte créé !",
        description: "Votre compte a été créé et vous êtes maintenant connecté."
      });

      return { 
        data,
        error: null 
      };

    } catch (error) {
      throw error;
    }
  }, [toast, checkUserExists]);

  const signIn = useCallback(async (email, password) => {
    try {
      // Vérifier d'abord si l'utilisateur existe avec un mot de passe
      const { exists, hasPassword, userId } = await checkUserExists(email);
      
      if (!exists) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      if (!hasPassword) {
        throw new Error("Vous devez d'abord créer votre mot de passe.");
      }

      // Récupérer le hash du mot de passe
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (fetchError || !userData?.password_hash) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      // Vérifier le mot de passe
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

      if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      // Connexion via Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Si l'utilisateur n'existe pas dans Auth, le créer
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined
            }
          });
          
          if (signUpError) {
            throw new Error("Erreur lors de la création de la session");
          }

          // Réessayer la connexion
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (retryError) {
            throw new Error("Email ou mot de passe incorrect.");
          }
        } else {
          throw new Error("Email ou mot de passe incorrect.");
        }
      }

      toast({
        title: "👋 Bienvenue !",
        description: "Vous êtes maintenant connecté.",
      });

      return { error: null };

    } catch (error) {
      toast({
        variant: "destructive",
        title: "La connexion a échoué",
        description: error.message,
      });
      return { error };
    }
  }, [toast, checkUserExists]);



  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "La déconnexion a échoué",
        description: error.message || "Une erreur est survenue.",
      });
    }

    return { error };
  }, [toast]);

  const checkUserExists = useCallback(async (email) => {
    try {
      // Vérifier dans notre base de données profiles (table users selon la nouvelle logique)
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, email, password_hash')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        return { exists: false, error, hasPassword: false };
      }
      
      return { 
        exists: !!userData, 
        error: null,
        hasPassword: !!userData?.password_hash,
        userId: userData?.id
      };
      
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      return { exists: false, error, hasPassword: false };
    }
  }, []);

  const validateTempPassword = useCallback(async (email, tempPassword) => {
    try {
      const { data, error } = await supabase.rpc('validate_temp_password', {
        p_email: email,
        p_temp_password: tempPassword
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return result;
    } catch (error) {
      console.error('Erreur validation mot de passe temporaire:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const completeFirstLogin = useCallback(async (email, password, keepTempPassword = false) => {
    try {
      // D'abord créer/mettre à jour l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        // Si l'utilisateur existe déjà dans auth, essayer de se connecter
        if (authError.message.includes('User already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });
          
          if (signInError) throw signInError;
        } else {
          throw authError;
        }
      }

      // Finaliser la première connexion
      const { data, error } = await supabase.rpc('complete_first_login', {
        p_email: email,
        p_password: password,
        p_keep_temp_password: keepTempPassword
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return result;
    } catch (error) {
      console.error('Erreur finalisation première connexion:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        p_email: email.toLowerCase()
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return result;
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createUserByAdmin = useCallback(async (userData) => {
    try {
      if (!user || (user.function !== 'Gerant' && user.function !== 'Associe Emerite' && user.role !== 'admin')) {
        throw new Error('Permissions insuffisantes pour créer un utilisateur');
      }

      const { data, error } = await supabase.rpc('admin_create_user', {
        p_email: userData.email.toLowerCase(),
        p_full_name: userData.fullName,
        p_function: userData.function,
        p_role: userData.role || 'user',
        p_admin_id: user.id
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return result;
    } catch (error) {
      console.error('Erreur création utilisateur par admin:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    createAccount,
    checkUserExists,
    validateTempPassword,
    completeFirstLogin,
    resetPassword,
    createUserByAdmin,
  }), [user, session, loading, signUp, signIn, signOut, createAccount, checkUserExists, validateTempPassword, completeFirstLogin, resetPassword, createUserByAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { generateConfirmationCodeWithExpiration } from '@/lib/codeGenerator';

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
      // Générer un code de confirmation à 6 caractères
      const confirmationData = generateConfirmationCodeWithExpiration(15); // Expire dans 15 minutes
      
      // Inscription via Supabase Auth avec code de confirmation personnalisé
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
            confirmation_code: confirmationData.code,
            code_expires_at: confirmationData.expiresAt
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error("Un compte avec cet email existe déjà");
        } else if (error.message.includes('Password should be at least')) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères");
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error("Format d'email invalide");
        } else {
          throw new Error(error.message || "Erreur lors de la création du compte");
        }
      }

      // Envoyer le code de confirmation par email (via fonction RPC)
      try {
        await supabase.rpc('send_confirmation_email', {
          p_email: email,
          p_confirmation_code: confirmationData.code,
          p_expires_at: confirmationData.expiresAt
        });
      } catch (emailError) {
        console.error('Erreur envoi email de confirmation:', emailError);
        // Ne pas échouer complètement si l'email ne peut pas être envoyé
        toast({
          variant: "destructive",
          title: "⚠️ Attention",
          description: "Compte créé mais l'email de confirmation n'a pas pu être envoyé."
        });
      }

      // Logger l'inscription
      try {
        await supabase.rpc('log_user_signup', {
          p_user_email: email,
          p_success: true
        });
      } catch (logError) {
        console.error('Erreur lors du logging de l\'inscription:', logError);
      }

      // Retourner les données avec le code pour référence
      return { 
        data: {
          ...data,
          confirmationCode: confirmationData.code // Pour tests/debug uniquement
        }, 
        error: null 
      };

    } catch (error) {
      // Logger l'échec
      try {
        await supabase.rpc('log_user_signup', {
          p_user_email: email,
          p_success: false
        });
      } catch (logError) {
        console.error('Erreur lors du logging de l\'inscription échouée:', logError);
      }

      throw error;
    }
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let description = "Vérifiez votre e-mail et mot de passe.";
      if (error.message.includes("Email not confirmed")) {
        description = "Votre e-mail n'a pas été confirmé. Veuillez vérifier votre boîte de réception.";
      } else if (error.message.includes("Failed to fetch")) {
        description = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
      }
      toast({
        variant: "destructive",
        title: "La connexion a échoué",
        description: description,
      });
    } else {
      toast({
        title: "👋 Bienvenue !",
        description: "Vous êtes maintenant connecté.",
      });
    }

    return { error };
  }, [toast]);

  const verifyConfirmationCode = useCallback(async (email, code) => {
    try {
      // Valider le code de confirmation via RPC
      const { data, error } = await supabase.rpc('verify_confirmation_code', {
        p_email: email,
        p_code: code
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        toast({
          title: "✅ Email confirmé",
          description: "Votre email a été confirmé avec succès ! Vous pouvez maintenant vous connecter."
        });
        return { success: true };
      } else {
        throw new Error(result.error || 'Code de confirmation invalide ou expiré');
      }
    } catch (error) {
      console.error('Erreur vérification code:', error);
      toast({
        variant: "destructive",
        title: "Code invalide",
        description: error.message || "Le code de confirmation est invalide ou a expiré."
      });
      return { success: false, error: error.message };
    }
  }, [toast]);

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
      // Vérifier dans notre base de données profiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, first_login, temp_password_expires_at')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        return { exists: false, error, isFirstLogin: false };
      }
      
      return { 
        exists: !!profileData, 
        error: null,
        isFirstLogin: profileData?.first_login || false,
        hasTempPassword: profileData?.temp_password_expires_at && new Date(profileData.temp_password_expires_at) > new Date()
      };
      
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      return { exists: false, error, isFirstLogin: false };
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
    verifyConfirmationCode,
  }), [user, session, loading, signUp, signIn, signOut, createAccount, checkUserExists, validateTempPassword, completeFirstLogin, resetPassword, createUserByAdmin, verifyConfirmationCode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
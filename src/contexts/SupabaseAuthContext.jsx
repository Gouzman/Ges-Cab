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

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Logger la tentative de connexion
    try {
      await supabase.rpc('log_user_signin', {
        p_user_email: email,
        p_success: !error
      });
    } catch (logError) {
      console.error('Erreur lors du logging de la connexion:', logError);
    }

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

  const trySignIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Logger la tentative de connexion (version silencieuse)
    try {
      await supabase.rpc('log_user_signin', {
        p_user_email: email,
        p_success: !error
      });
    } catch (logError) {
      console.error('Erreur lors du logging de la tentative de connexion:', logError);
    }

    return { error };
  }, []);

  const checkUserExists = useCallback(async (email) => {
    try {
      // Tentative de connexion avec un mot de passe fictif
      const { error } = await trySignIn(email, 'dummy-password-for-check');
      
      // Si l'erreur indique "Invalid login credentials", l'utilisateur existe
      if (error?.message?.includes('Invalid login credentials')) {
        return { exists: true, error: null };
      }
      
      // Si l'erreur indique "Email not confirmed", l'utilisateur existe mais n'est pas confirmé
      if (error?.message?.includes('Email not confirmed')) {
        return { exists: true, error: null };
      }
      
      // Si pas d'erreur (connexion réussie avec le dummy password - très improbable)
      if (!error) {
        await supabase.auth.signOut(); // Déconnexion immédiate
        return { exists: true, error: null };
      }
      
      // Autres erreurs - on considère que l'utilisateur n'existe pas
      return { exists: false, error: null };
    } catch (error) {
      return { exists: false, error };
    }
  }, [trySignIn]);

  const updateUserPermissions = useCallback(async (userId, permissions) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permissions: permissions
        });

      if (error) {
        console.error("Error updating permissions:", error);
        toast({
          variant: "destructive",
          title: "Erreur de permissions",
          description: "Impossible de mettre à jour les permissions."
        });
        return { success: false, error };
      }

      toast({
        title: "✅ Permissions mises à jour",
        description: "Les permissions ont été sauvegardées avec succès."
      });

      return { success: true, error: null };
    } catch (error) {
      console.error("Network error updating permissions:", error);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible de sauvegarder les permissions."
      });
      return { success: false, error };
    }
  }, [toast]);

  const getAllUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, function, created_at')
        .neq('role', 'Admin')
        .neq('function', 'Admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des utilisateurs."
        });
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Network error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible de récupérer les utilisateurs."
      });
      return { data: [], error };
    }
  }, [toast]);

  const getUserPermissions = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user permissions:", error);
        return { permissions: null, error };
      }

      return { permissions: data?.permissions || null, error: null };
    } catch (error) {
      console.error("Network error fetching permissions:", error);
      return { permissions: null, error };
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (session?.user) {
      const profile = await fetchUserProfileAndPermissions(session.user.id);
      setUser(profile);
    }
  }, [session?.user, fetchUserProfileAndPermissions]);

  const getCollaborators = useCallback(async () => {
    try {
      // Récupérer tous les profiles d'abord
      const { data: allData, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, function, created_at')
        .order('name');
      
      if (error) throw error;
      
      // Filtrer côté client pour exclure les Admin
      const filteredData = (allData || []).filter(user => 
        user.role !== 'Admin' && user.function !== 'Admin'
      );

      return { data: filteredData, error: null };
    } catch (error) {
      console.error("Network error fetching collaborators:", error);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible de récupérer les collaborateurs."
      });
      return { data: [], error };
    }
  }, [toast]);

  const resetUserPassword = useCallback(async (userEmail) => {
    try {
      // Envoyer l'email de réinitialisation
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur de réinitialisation",
          description: error.message || "Impossible d'envoyer l'email de réinitialisation."
        });
        return { error };
      }

      // Logger l'action de réinitialisation
      try {
        await supabase.rpc('log_password_reset', {
          p_user_email: userEmail,
          p_initiated_by: user?.id || null
        });
      } catch (logError) {
        console.error('Erreur lors du logging de la réinitialisation:', logError);
      }

      toast({
        title: "Email envoyé",
        description: `Un email de réinitialisation a été envoyé à ${userEmail}.`
      });

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible d'envoyer l'email de réinitialisation."
      });
      return { error };
    }
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    trySignIn,
    checkUserExists,
    updateUserPermissions,
    getAllUsers,
    getCollaborators,
    getUserPermissions,
    refreshCurrentUser,
    resetUserPassword,
  }), [user, session, loading, signUp, signIn, signOut, trySignIn, checkUserExists, updateUserPermissions, getAllUsers, getCollaborators, getUserPermissions, refreshCurrentUser, resetUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
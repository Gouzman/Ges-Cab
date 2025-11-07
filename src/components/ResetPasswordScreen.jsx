import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { validatePassword } from '@/lib/authValidation';
import { Lock, Eye, EyeOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const ResetPasswordScreen = () => {
  const { updatePasswordWithToken } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid
  const [resetSuccess, setResetSuccess] = useState(false);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const checkToken = async () => {
      // Récupérer les paramètres de l'URL (query params et hash fragment)
      const urlParams = new URLSearchParams(globalThis.location.search);
      const hashParams = new URLSearchParams(globalThis.location.hash.substring(1));
      
      // Vérifier les différents formats possibles de token
      const token = urlParams.get('token') || 
                   urlParams.get('access_token') ||
                   hashParams.get('access_token') ||
                   hashParams.get('token');
      
      const type = urlParams.get('type') || hashParams.get('type');
      
      if (!token || type !== 'recovery') {
        setTokenValid(false);
        return;
      }

      try {
        // Le token sera automatiquement utilisé par Supabase si présent dans l'URL
        // On teste si on peut récupérer la session de récupération
        // Note: Reset password functionality needs to be implemented with new backend API
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          // Tenter de vérifier le token manuellement
          const { data: { user }, error: userError } = await supabase.auth.getUser(token);
          if (userError || !user) {
            setTokenValid(false);
          } else {
            setTokenValid(true);
          }
        } else {
          setTokenValid(true);
        }
      } catch (error) {
        console.error('Erreur vérification token:', error);
        setTokenValid(false);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas."
      });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isMinimumValid) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop faible",
        description: "Le mot de passe doit contenir au moins 6 caractères."
      });
      return;
    }

    try {
      setLoading(true);
      
      const result = await updatePasswordWithToken(password);
      
      if (result.success) {
        setResetSuccess(true);
        toast({
          title: "🎉 Mot de passe réinitialisé",
          description: "Votre mot de passe a été réinitialisé avec succès."
        });
        
        // Redirection vers la page principale après 3 secondes
        setTimeout(() => {
          globalThis.location.href = '/';
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe."
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  // Affichage pendant la vérification du token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Vérification du lien de réinitialisation...</p>
        </div>
      </div>
    );
  }

  // Affichage si le token est invalide
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center"
        >
          <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mb-6 mx-auto w-fit">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Lien invalide ou expiré</h1>
          <p className="text-slate-400 mb-6">
            Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien de réinitialisation.
          </p>
          <Button
            onClick={() => globalThis.location.href = '/'}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            Retour à la connexion
          </Button>
        </motion.div>
      </div>
    );
  }

  // Affichage de succès
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center"
        >
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-6 mx-auto w-fit">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Mot de passe réinitialisé !</h1>
          <p className="text-slate-400 mb-6">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              Redirection automatique dans quelques secondes...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ges-Cab</h1>
          <p className="text-slate-400 text-center">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choisissez un mot de passe sécurisé"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Validation du mot de passe */}
          {password && (
            <div className="space-y-2 text-sm">
              <div className={`flex items-center space-x-2 ${passwordValidation.isMinimumValid ? 'text-green-400' : 'text-red-400'}`}>
                {passwordValidation.isMinimumValid ? '✅' : '❌'}
                <span>Au moins 6 caractères</span>
              </div>
              
              {confirmPassword && (
                <div className={`flex items-center space-x-2 ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✅' : '❌'}
                  <span>Les mots de passe correspondent</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !passwordValidation.isMinimumValid || password !== confirmPassword}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Réinitialisation...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Réinitialiser le mot de passe
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordScreen;
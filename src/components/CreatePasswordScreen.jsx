import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import ValidationIcon from '@/components/ui/ValidationIcon';

const CreatePasswordScreen = ({ email, onCancel, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Validation du mot de passe
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        variant: "destructive",
        title: "Mot de passe invalide",
        description: "Veuillez respecter tous les critères de sécurité."
      });
      return;
    }

    if (!doPasswordsMatch) {
      toast({
        variant: "destructive",
        title: "Mots de passe différents",
        description: "Les mots de passe ne correspondent pas."
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, {
        data: { 
          name: email.split('@')[0], // Nom par défaut basé sur l'email
          role: 'User', 
          function: 'Utilisateur' 
        }
      });

      if (error) {
        let errorMsg = error.message;
        if (error.message.includes('User already registered')) {
          errorMsg = "Un compte avec cet email existe déjà. Essayez de vous connecter.";
        } else if (error.message.includes('email_address_invalid')) {
          errorMsg = "Adresse email invalide.";
        }
        toast({
          variant: "destructive",
          title: "Erreur lors de la création du compte",
          description: errorMsg
        });
      } else {
        toast({
          title: "🎉 Compte créé avec succès !",
          description: "Vous êtes maintenant connecté."
        });
        onSuccess?.();
      }
    } catch (err) {
      console.error('Erreur lors de la création du compte:', err);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible de créer le compte. Vérifiez votre connexion."
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Créer un mot de passe</h1>
          <p className="text-slate-400 text-center mt-2">
            Créez un mot de passe sécurisé pour<br />
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleCreatePassword} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe
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
                placeholder="Créez un mot de passe sécurisé"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <ValidationIcon isValid={doPasswordsMatch} />
                <span className={`text-sm ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                  {doPasswordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                </span>
              </div>
            )}
          </div>

          {/* Critères de validation du mot de passe */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-slate-300 font-medium mb-3">Critères de sécurité :</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ValidationIcon isValid={passwordValidation.minLength} />
                <span className={`text-sm ${passwordValidation.minLength ? 'text-green-500' : 'text-slate-400'}`}>
                  Au moins 8 caractères
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                <span className={`text-sm ${passwordValidation.hasUpperCase ? 'text-green-500' : 'text-slate-400'}`}>
                  Une majuscule
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ValidationIcon isValid={passwordValidation.hasLowerCase} />
                <span className={`text-sm ${passwordValidation.hasLowerCase ? 'text-green-500' : 'text-slate-400'}`}>
                  Une minuscule
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ValidationIcon isValid={passwordValidation.hasNumber} />
                <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-500' : 'text-slate-400'}`}>
                  Un chiffre
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ValidationIcon isValid={passwordValidation.hasSpecialChar} />
                <span className={`text-sm ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-slate-400'}`}>
                  Un caractère spécial
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création...' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePasswordScreen;
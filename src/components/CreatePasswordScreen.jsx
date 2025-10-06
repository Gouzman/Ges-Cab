import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  validatePassword, 
  getPasswordStrengthColor, 
  getPasswordStrengthText, 
  getSupabaseErrorMessage 
} from '@/lib/authValidation';

const CreatePasswordScreen = ({ email, onCancel, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createAccount } = useAuth();
  const { toast } = useToast();

  // Validation du mot de passe avec nouveaux critères renforcés
  const passwordValidation = validatePassword(password);
  const isPasswordValid = passwordValidation.requiredMet; // ✅ Critères obligatoires
  const isPasswordMatch = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (!isPasswordMatch) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    if (!isPasswordValid) {
      const failedRequired = passwordValidation.validations
        .filter(v => v.required && !v.test)
        .map(v => v.message);
      
      toast({
        variant: "destructive",
        title: "Critères de sécurité non respectés",
        description: `Requis: ${failedRequired.join(', ')}`,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await createAccount(email, password);
      
      toast({
        title: "✅ Compte créé avec succès",
        description: "Vous êtes maintenant connecté à votre espace de travail",
      });
      
      // Redirection automatique vers le tableau de bord
      onSuccess();
      
    } catch (error) {
      const errorMessage = getSupabaseErrorMessage(error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la création",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-6">
          <button
            onClick={onCancel}
            className="flex items-center text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Créer votre mot de passe</h2>
            <p className="text-slate-400 mt-2">
              Pour <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Indicateurs de validation du mot de passe */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4" />
                    <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.securityLevel)}`}>
                      {getPasswordStrengthText(passwordValidation.securityLevel)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {passwordValidation.validations.map((validation) => (
                      <div key={validation.message} className="flex items-center gap-2 text-sm">
                        {validation.test ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={validation.test ? 'text-green-400' : 'text-slate-400'}>
                          {validation.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Indicateur de correspondance des mots de passe */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-400">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-red-400">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || !isPasswordMatch}
              className="w-full h-12 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </Button>
            
            {password && confirmPassword && (
              <div className="text-center text-xs text-slate-400 mt-3">
                En créant votre compte, vous acceptez nos conditions d'utilisation
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// PropTypes pour la validation des props
CreatePasswordScreen.propTypes = {
  email: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default CreatePasswordScreen;
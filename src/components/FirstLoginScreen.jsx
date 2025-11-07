import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SimpleAuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePassword } from '@/lib/authValidation';
import { Eye, EyeOff, Key, Check, X, RefreshCw } from 'lucide-react';

const FirstLoginScreen = ({ email, onSuccess, onBack }) => {
  const { toast } = useAuth();
  const [step, setStep] = useState('temp-password'); // 'temp-password' | 'set-password'
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keepTempPassword, setKeepTempPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleTempPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!tempPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir le mot de passe temporaire."
      });
      return;
    }

    try {
      setLoading(true);
      
      // Valider le mot de passe temporaire
      const { data, error } = await supabase.rpc('validate_temp_password', {
        p_email: email,
        p_temp_password: tempPassword
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        setUserProfile(result);
        setStep('set-password');
        toast({
          title: "✅ Mot de passe validé",
          description: `Bienvenue ${result.full_name} !`
        });
      } else {
        throw new Error(result.error || 'Mot de passe temporaire invalide');
      }
    } catch (error) {
      console.error('Erreur validation mot de passe temporaire:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Mot de passe temporaire invalide ou expiré."
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChoice = async (keepTemp) => {
    try {
      setLoading(true);
      
      if (!keepTemp) {
        // Valider le nouveau mot de passe
        if (newPassword !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Les mots de passe ne correspondent pas."
          });
          return;
        }

        const validation = validatePassword(newPassword);
        if (!validation.isMinimumValid) {
          toast({
            variant: "destructive",
            title: "Mot de passe trop faible",
            description: "Le mot de passe doit contenir au moins 6 caractères."
          });
          return;
        }
      }

      const finalPassword = keepTemp ? tempPassword : newPassword;

      // Créer le compte dans Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: email,
        password: finalPassword,
        options: {
          data: {
            full_name: userProfile.full_name,
            function: userProfile.function,
            role: userProfile.role
          }
        }
      });

      if (authError) {
        // Si l'utilisateur existe déjà dans auth, essayer de se connecter
        if (authError.message.includes('User already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: finalPassword
          });
          
          if (signInError) throw signInError;
        } else {
          throw authError;
        }
      }

      // Finaliser la première connexion
      const { data: completeData, error: completeError } = await supabase.rpc('complete_first_login', {
        p_email: email,
        p_password: finalPassword,
        p_keep_temp_password: keepTemp
      });

      if (completeError) throw completeError;

      const completeResult = typeof completeData === 'string' ? JSON.parse(completeData) : completeData;

      if (completeResult.success) {
        toast({
          title: "🎉 Compte activé",
          description: "Votre compte a été configuré avec succès !"
        });
        onSuccess();
      } else {
        throw new Error(completeResult.error || 'Erreur lors de la finalisation');
      }
    } catch (error) {
      console.error('Erreur finalisation compte:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de finaliser la création du compte."
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'temp-password' ? 'Première Connexion' : 'Configuration du Mot de Passe'}
          </CardTitle>
          <CardDescription>
            {step === 'temp-password' 
              ? 'Saisissez le mot de passe temporaire qui vous a été envoyé'
              : 'Choisissez votre mot de passe pour les prochaines connexions'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'temp-password' ? (
            <form onSubmit={handleTempPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temp-password">Mot de passe temporaire</Label>
                <div className="relative">
                  <Input
                    id="temp-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Saisissez le mot de passe temporaire"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Le mot de passe temporaire est composé de 8 caractères (lettres et chiffres)
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    'Valider'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Bienvenue {userProfile?.full_name} !
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Fonction: {userProfile?.function}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Choisissez votre mot de passe :</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setKeepTempPassword(true)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      keepTempPassword 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Conserver le mot de passe temporaire</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Utilisez le mot de passe temporaire pour vos prochaines connexions
                    </p>
                  </button>

                  <button
                    onClick={() => setKeepTempPassword(false)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      keepTempPassword === false
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Choisir un nouveau mot de passe</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Définissez votre propre mot de passe sécurisé
                    </p>
                  </button>
                </div>

                {!keepTempPassword && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Choisissez un mot de passe"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          {passwordValidation.isMinimumValid ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={passwordValidation.isMinimumValid ? 'text-green-700' : 'text-red-700'}>
                            Au moins 6 caractères
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          {newPassword === confirmPassword && confirmPassword ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={newPassword === confirmPassword && confirmPassword ? 'text-green-700' : 'text-red-700'}>
                            Les mots de passe correspondent
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handlePasswordChoice(keepTempPassword)}
                  disabled={loading || (!keepTempPassword && (!newPassword || newPassword !== confirmPassword || !passwordValidation.isMinimumValid))}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Configuration...
                    </>
                  ) : (
                    'Finaliser la configuration'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

FirstLoginScreen.propTypes = {
  email: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default FirstLoginScreen;
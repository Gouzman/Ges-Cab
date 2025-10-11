import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePassword } from '@/lib/authValidation';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, RefreshCw, Key } from 'lucide-react';

const ForgotPasswordScreen = ({ onBack, onSuccess }) => {
  const { toast } = useToast();
  const [step, setStep] = useState('email'); // 'email' | 'temp-password' | 'new-password'
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir votre adresse email."
      });
      return;
    }

    try {
      setLoading(true);
      
      // Demander la réinitialisation du mot de passe
      const { data, error } = await supabase.rpc('reset_user_password', {
        p_email: email.toLowerCase()
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        setStep('temp-password');
        toast({
          title: "📧 Email envoyé",
          description: "Si cet email existe, un nouveau mot de passe temporaire a été envoyé."
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le mot de passe temporaire."
      });
    } finally {
      setLoading(false);
    }
  };

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
        setStep('new-password');
        toast({
          title: "✅ Mot de passe validé",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe."
        });
      } else {
        throw new Error(result.error || 'Mot de passe temporaire invalide');
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Mot de passe temporaire invalide ou expiré."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    
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

    try {
      setLoading(true);
      
      // Mettre à jour le mot de passe dans Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        // Si pas connecté, essayer de se connecter avec le mot de passe temporaire d'abord
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: tempPassword
        });

        if (signInError) throw signInError;

        // Puis mettre à jour le mot de passe
        const { error: updateError2 } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError2) throw updateError2;
      }

      // Finaliser la réinitialisation
      const { data: completeData, error: completeError } = await supabase.rpc('complete_first_login', {
        p_email: email,
        p_password: newPassword,
        p_keep_temp_password: false
      });

      if (completeError) throw completeError;

      toast({
        title: "🎉 Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès !"
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe."
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
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {step === 'email' ? (
              <Mail className="w-6 h-6 text-orange-600" />
            ) : step === 'temp-password' ? (
              <Key className="w-6 h-6 text-orange-600" />
            ) : (
              <Lock className="w-6 h-6 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'email' && 'Mot de passe oublié'}
            {step === 'temp-password' && 'Mot de passe temporaire'}
            {step === 'new-password' && 'Nouveau mot de passe'}
          </CardTitle>
          <CardDescription>
            {step === 'email' && 'Saisissez votre email pour recevoir un nouveau mot de passe temporaire'}
            {step === 'temp-password' && 'Saisissez le mot de passe temporaire reçu par email'}
            {step === 'new-password' && 'Choisissez votre nouveau mot de passe'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Un nouveau mot de passe temporaire sera envoyé à cette adresse
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 'temp-password' && (
            <form onSubmit={handleTempPasswordSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  📧 Un mot de passe temporaire a été envoyé à <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temp-password">Mot de passe temporaire</Label>
                <div className="relative">
                  <Input
                    id="temp-password"
                    type={showTempPassword ? "text" : "password"}
                    placeholder="Saisissez le mot de passe temporaire"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                  >
                    {showTempPassword ? (
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
                  onClick={() => setStep('email')}
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
          )}

          {step === 'new-password' && (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Mot de passe temporaire validé. Définissez maintenant votre nouveau mot de passe.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Choisissez un mot de passe sécurisé"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
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
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Validation du mot de passe */}
              {newPassword && (
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center space-x-2 ${passwordValidation.isMinimumValid ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.isMinimumValid ? '✅' : '❌'}
                    <span>Au moins 6 caractères</span>
                  </div>
                  
                  {confirmPassword && (
                    <div className={`flex items-center space-x-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {newPassword === confirmPassword ? '✅' : '❌'}
                      <span>Les mots de passe correspondent</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !passwordValidation.isMinimumValid || newPassword !== confirmPassword}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordScreen;
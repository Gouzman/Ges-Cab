import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Mail, Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { validateConfirmationCode } from '@/lib/codeGenerator';

const EmailConfirmationScreen = ({ email, onSuccess, onBack }) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { verifyConfirmationCode } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirmationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez saisir le code de confirmation."
      });
      return;
    }

    if (!validateConfirmationCode(confirmationCode)) {
      toast({
        variant: "destructive",
        title: "Code invalide",
        description: "Le code doit contenir exactement 6 caractères (lettres, chiffres et symboles)."
      });
      return;
    }

    try {
      setLoading(true);
      
      const result = await verifyConfirmationCode(email, confirmationCode);
      
      if (result.success) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur vérification code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      // Simuler renvoyer le code (à implémenter côté serveur)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "📧 Code renvoyé",
        description: "Un nouveau code de confirmation a été envoyé à votre email."
      });
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de renvoyer le code. Réessayez plus tard."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Confirmez votre email</CardTitle>
          <CardDescription>
            Nous avons envoyé un code de confirmation à<br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Code de sécurité requis
              </span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Saisissez le code à 6 caractères reçu par email (ex: 2467e!)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation-code">Code de confirmation</Label>
              <Input
                id="confirmation-code"
                type="text"
                placeholder="2467e!"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toLowerCase())}
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-600">
                Le code contient 6 caractères (lettres, chiffres et symboles)
              </p>
            </div>

            <div className="flex gap-3">
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
                    Vérification...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </div>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 mb-2">
              Vous n'avez pas reçu le code ?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={loading}
                className="text-blue-600 hover:text-blue-500"
              >
                Renvoyer le code
              </Button>
              
              {import.meta.env.VITE_APP_ENV === 'development' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const testCode = "2467e!"; 
                    setConfirmationCode(testCode);
                    toast({
                      title: "🧪 Mode dev",
                      description: `Code de test inséré: ${testCode}`
                    });
                  }}
                  className="text-xs"
                >
                  🧪 Utiliser code de test (dev)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

EmailConfirmationScreen.propTypes = {
  email: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EmailConfirmationScreen;
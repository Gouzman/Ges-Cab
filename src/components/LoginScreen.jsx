import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import CreatePasswordScreen from './CreatePasswordScreen';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState('email'); // 'email', 'password', 'create-password'
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, checkUserExists } = useAuth();
  const { toast } = useToast();

  // Test des toasts au chargement
  useEffect(() => {
    // Toast de test pour vérifier que le système fonctionne
    const timer = setTimeout(() => {
      if (import.meta.env.VITE_APP_ENV === 'development') {
        toast({
          title: "🔧 Mode développement",
          description: "Système de toasts opérationnel !"
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Étape 1: Vérifier l'email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide."
      });
      return;
    }

    setIsLoading(true);

    try {
      const { exists, error } = await checkUserExists(email);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur de vérification",
          description: "Impossible de vérifier l'email. Réessayez."
        });
        setIsLoading(false);
        return;
      }

      if (exists) {
        // Utilisateur existe, passer à la connexion
        setCurrentStep('password');
      } else {
        // Nouvel utilisateur, passer à la création de mot de passe
        setCurrentStep('create-password');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'email:', err);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Vérifiez votre connexion internet."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2: Connexion avec mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // Connexion réussie - le contexte d'auth gère la redirection
        return;
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Retour à l'étape email
  const handleBackToEmail = () => {
    setCurrentStep('email');
    setPassword('');
  };

  // Succès création de compte
  const handleCreatePasswordSuccess = () => {
    // Le contexte d'auth gère la redirection après inscription réussie
    // La session sera automatiquement mise à jour
  };

  // Annuler création de mot de passe
  const handleCreatePasswordCancel = () => {
    setCurrentStep('email');
  };

  // Rendu conditionnel selon l'étape
  if (currentStep === 'create-password') {
    return (
      <CreatePasswordScreen
        email={email}
        onCancel={handleCreatePasswordCancel}
        onSuccess={handleCreatePasswordSuccess}
      />
    );
  }

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
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ges-Cab</h1>
          <p className="text-slate-400 text-center">
            {currentStep === 'email' 
              ? 'Entrez votre adresse email pour continuer'
              : 'Entrez votre mot de passe'
            }
          </p>
        </div>

        {currentStep === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="votre@email.com"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? (
                'Vérification...'
              ) : (
                <>
                  Continuer <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        )}

        {currentStep === 'password' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <span className="font-medium">Compte trouvé !</span><br />
                Connecté en tant que : <span className="text-white">{email}</span>
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleBackToEmail}
                  variant="outline"
                  className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginScreen;
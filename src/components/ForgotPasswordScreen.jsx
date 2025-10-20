import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, RefreshCw, Key } from 'lucide-react';

const ForgotPasswordScreen = ({ onBack, onSuccess, embedded = false }) => {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [developmentInfo, setDevelopmentInfo] = useState(null);

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

    try {
      setLoading(true);
      
      // Demander la réinitialisation du mot de passe
      const result = await requestPasswordReset(email);

      if (result.success) {
        setEmailSent(true);
        setDevelopmentInfo(result.isDevelopment ? { mailpitUrl: result.mailpitUrl } : null);
        
        // Message différent selon la configuration
        if (result.isDevelopment && result.mailpitUrl) {
          // Mode développement avec Mailpit (SMTP non configuré)
          toast({
            title: "📧 Email envoyé à Mailpit (Test Local)",
            description: (
              <div className="space-y-2">
                <p>L'email a été capturé par Mailpit (serveur de test local).</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(result.mailpitUrl, '_blank')}
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    🔗 Ouvrir Mailpit ({result.mailpitUrl})
                  </button>
                </div>
              </div>
            ),
            duration: 10000
          });
        } else if (result.isDevelopment && result.hasRealSMTP) {
          // Mode développement avec SMTP configuré (vrais emails)
          toast({
            title: "📧 Email envoyé à votre adresse Gmail",
            description: (
              <div className="space-y-2">
                <p>Un email de réinitialisation a été envoyé à <strong>{email}</strong></p>
                <p className="text-sm text-green-300">✅ SMTP configuré - Email réel envoyé via Gmail</p>
              </div>
            ),
            duration: 8000
          });
        } else {
          // Mode production
          toast({
            title: "📧 Lien de réinitialisation envoyé",
            description: "Un lien de réinitialisation a été envoyé à votre adresse email."
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue."
      });
    } finally {
      setLoading(false);
    }
  };



  // Si le composant est intégré dans LoginScreen, on rend juste le contenu
  if (embedded) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <p className="text-slate-400 text-center">
            {emailSent 
              ? 'Vérifiez votre boîte email' 
              : 'Entrez votre email pour recevoir un lien de réinitialisation'
            }
          </p>
        </div>

        {!emailSent ? (
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
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le lien
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-green-400 mr-3" />
                <div>
                  <p className="text-green-400 font-medium">Lien envoyé avec succès !</p>
                  <p className="text-green-300 text-sm mt-1">
                    Vérifiez votre boîte email à l'adresse <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>Instructions :</strong>
              </p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1 ml-4">
                <li>• Cliquez sur le lien dans l'email reçu</li>
                <li>• Vous serez redirigé vers la page de réinitialisation</li>
                <li>• Définissez votre nouveau mot de passe</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Renvoyer
              </Button>
              <Button
                onClick={onBack}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Version standalone (avec structure complète)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ges-Cab</h1>
          <p className="text-slate-400 text-center">
            {emailSent 
              ? 'Vérifiez votre boîte email' 
              : 'Entrez votre email pour recevoir un lien de réinitialisation'
            }
          </p>
        </div>

        {!emailSent ? (
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
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le lien
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-green-400 mr-3" />
                <div>
                  <p className="text-green-400 font-medium">Lien envoyé avec succès !</p>
                  <p className="text-green-300 text-sm mt-1">
                    Vérifiez votre boîte email à l'adresse <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>Instructions :</strong>
              </p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1 ml-4">
                <li>• Cliquez sur le lien dans l'email reçu</li>
                <li>• Vous serez redirigé vers la page de réinitialisation</li>
                <li>• Définissez votre nouveau mot de passe</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Renvoyer
              </Button>
              <Button
                onClick={onBack}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ForgotPasswordScreen;
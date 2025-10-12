import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const CreatePasswordScreen = ({ email, onCancel, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createAccount } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères."
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mots de passe différents",
        description: "Les mots de passe ne correspondent pas."
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await createAccount(email, password);
      
      if (!error) {
        // L'utilisateur est automatiquement connecté après création
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur lors de la création du compte:', err);
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: err.message || "Impossible de créer le compte. Réessayez."
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
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-400 text-center mt-2">
            Définissez votre mot de passe pour <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, User, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const SignUpScreen = ({ setAuthView }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { error } = await signUp(email, password, {
      data: {
        name: name,
        role: 'Admin' // Default role for first user
      }
    });
    if (!error) {
      toast({
        title: "✅ Compte créé !",
        description: "Vous pouvez maintenant vous connecter.",
      });
      setAuthView('login');
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
          <p className="text-slate-400">Rejoignez LegalTask Pro</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Jean Dupont"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@exemple.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6+ caractères"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-teal-700"
          >
            S'inscrire
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-slate-400">
            Déjà un compte ?{' '}
            <button
              onClick={() => setAuthView('login')}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Se connecter
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpScreen;
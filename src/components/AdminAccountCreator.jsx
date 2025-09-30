import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAccountCreator = ({ onAccountCreated }) => {
  const { signUp } = useAuth();
  const [status, setStatus] = useState('creating'); // 'creating', 'success', 'exists', 'error'

  useEffect(() => {
    const createAdminAccount = async () => {
      const email = 'tleojeanluc@gmail.com';
      const password = 'Jesus@1';
      const name = 'Jean Luc TAE';

      const { error } = await signUp(email, password, {
        data: {
          name: name,
          role: 'Admin'
        }
      }, true); // Pass silent = true

      if (error) {
        if (error.message.includes('User already registered')) {
          setStatus('exists');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('success');
      }
    };

    createAdminAccount();
  }, [signUp]);

  const renderContent = () => {
    switch (status) {
      case 'creating':
        return (
          <>
            <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white">Création de votre compte...</h2>
            <p className="text-slate-300">Veuillez patienter un instant.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white">Compte Administrateur Créé !</h2>
            <p className="text-slate-300 mt-2">Vous pouvez maintenant vous connecter avec :</p>
            <div className="text-left bg-slate-800 p-4 rounded-lg mt-4 w-full max-w-sm">
              <p className="text-slate-200"><span className="font-bold">Email :</span> tleojeanluc@gmail.com</p>
              <p className="text-slate-200"><span className="font-bold">Mot de passe :</span> Jesus@1</p>
            </div>
          </>
        );
      case 'exists':
        return (
          <>
            <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold text-white">Compte déjà existant.</h2>
            <p className="text-slate-300 mt-2">Le compte administrateur existe déjà. Veuillez vous connecter :</p>
            <div className="text-left bg-slate-800 p-4 rounded-lg mt-4 w-full max-w-sm">
              <p className="text-slate-200"><span className="font-bold">Email :</span> tleojeanluc@gmail.com</p>
              <p className="text-slate-200"><span className="font-bold">Mot de passe :</span> Jesus@1</p>
            </div>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white">Erreur de création</h2>
            <p className="text-slate-300 mt-2">Une erreur est survenue. Veuillez réessayer.</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        {renderContent()}
        {(status === 'success' || status === 'exists' || status === 'error') && (
          <button
            onClick={onAccountCreated}
            className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aller à la page de connexion
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default AdminAccountCreator;
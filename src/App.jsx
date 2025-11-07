import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from './components/ui/toaster';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import ClientManager from './components/ClientManager';
import CaseManager from './components/CaseManager';
import Calendar from './components/Calendar';
import Reports from './components/Reports';
import TeamManager from './components/TeamManager';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import DocumentManager from './components/DocumentManager';
import Settings from './components/Settings';
import BillingManager from './components/BillingManager';
import { useAuth } from './contexts/SimpleAuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, loading, signOut } = useAuth();

  // Détecter la route courante pour les écrans de réinitialisation
  const currentPath = globalThis.location.pathname;
  const urlParams = new URLSearchParams(globalThis.location.search);
  const hashParams = new URLSearchParams(globalThis.location.hash.substring(1));
  
  const isResetPasswordFlow = currentPath === '/reset-password' || 
                             globalThis.location.hash.includes('type=recovery') ||
                             hashParams.get('type') === 'recovery' ||
                             urlParams.get('type') === 'recovery';
  const isForgotPasswordFlow = currentPath === '/forgot-password';

  // ✨ Définir le titre de la page avec l'API native (remplacement de react-helmet)
  useEffect(() => {
    document.title = 'LegalTask Pro - Cabinet d\'Avocat';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Plateforme de gestion des tâches professionnelle pour cabinets d\'avocats. Gérez vos dossiers, clients et échéances efficacement.');
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    setActiveView('dashboard');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard currentUser={user} setActiveView={setActiveView} />;
      case 'tasks':
        return <TaskManager currentUser={user} />;
      case 'clients':
        return <ClientManager currentUser={user} />;
      case 'cases':
        return <CaseManager currentUser={user} />;
      case 'calendar':
        return <Calendar currentUser={user} />;
      case 'team':
        return <TeamManager currentUser={user} />;
      case 'reports':
        return <Reports currentUser={user} />;
      case 'documents':
        return <DocumentManager currentUser={user} />;
      case 'billing':
        return <BillingManager currentUser={user} />;
      case 'settings':
        return <Settings currentUser={user} />;
      default:
        return <Dashboard currentUser={user} setActiveView={setActiveView} />;
    }
  };

  // Afficher le loader pendant l'initialisation de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium">Chargement de l'application...</p>
      </div>
    );
  }
  


  // Gérer les écrans de réinitialisation de mot de passe
  if (isResetPasswordFlow) {
    return (
      <>
        <ResetPasswordScreen />
        <Toaster />
      </>
    );
  }

  if (isForgotPasswordFlow) {
    return (
      <>
        <ForgotPasswordScreen />
        <Toaster />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }
  
  // Interface principale pour les utilisateurs connectés
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 print:bg-white">
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          currentUser={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 ml-64 print:ml-0">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 print:p-0"
          >
            {renderActiveView()}
          </motion.div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;
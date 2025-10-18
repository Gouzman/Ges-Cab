import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Toaster } from '@/components/ui/toaster';
    import Sidebar from '@/components/Sidebar';
    import Dashboard from '@/components/Dashboard';
    import TaskManager from '@/components/TaskManager';
    import ClientManager from '@/components/ClientManager';
    import CaseManager from '@/components/CaseManager';
    import Calendar from '@/components/Calendar';
    import Reports from '@/components/Reports';
    import TeamManager from '@/components/TeamManager';
    import LoginScreen from '@/components/LoginScreen';
    import ForgotPasswordScreen from '@/components/ForgotPasswordScreen';
    import ResetPasswordScreen from '@/components/ResetPasswordScreen';
    import DocumentManager from '@/components/DocumentManager';
    import Settings from '@/components/Settings';
    import BillingManager from '@/components/BillingManager';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Loader2 } from 'lucide-react';
    import CorsTestComponent from '@/components/CorsTestComponent';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showCorsTest, setShowCorsTest] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Détecter la route courante pour les écrans de réinitialisation
  const currentPath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  const isResetPasswordFlow = currentPath === '/reset-password' || 
                             window.location.hash.includes('type=recovery') ||
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
  
  // Afficher l'outil de diagnostic CORS en mode développement avec le paramètre d'URL
  const showDiagnostic = import.meta.env.DEV && urlParams.get('diagnostic') === 'cors';
  if (showDiagnostic) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Diagnostic de Connexion Supabase</h1>
        <CorsTestComponent />
        <div className="mt-8">
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retour à l'application
          </button>
        </div>
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
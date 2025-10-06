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
    import DocumentManager from '@/components/DocumentManager';
    import Settings from '@/components/Settings';
    import BillingManager from '@/components/BillingManager';
    import RateLimitDebugPanel from '@/components/RateLimitDebugPanel';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Loader2 } from 'lucide-react';

    function App() {
      const [activeView, setActiveView] = useState('dashboard');
      const { user, loading, signOut } = useAuth();

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

      if (loading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        );
      }

      if (!user) {
        return (
          <>
            <LoginScreen />
            <Toaster />
            <RateLimitDebugPanel />
          </>
        );
      }

      // ✨ Définir le titre de la page avec l'API native (remplacement de react-helmet)
      useEffect(() => {
        document.title = 'LegalTask Pro - Cabinet d\'Avocat';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Plateforme de gestion des tâches professionnelle pour cabinets d\'avocats. Gérez vos dossiers, clients et échéances efficacement.');
        }
      }, []);

      return (
        <>
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
            <RateLimitDebugPanel />
          </div>
        </>
      );
    }

    export default App;
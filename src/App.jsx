import React, { useState, Suspense, lazy } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Toaster } from '@/components/ui/toaster';
    import Sidebar from '@/components/Sidebar';
    import NewLoginScreen from '@/components/NewLoginScreen';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Loader2 } from 'lucide-react';

    // Lazy loading des composants principaux pour réduire le bundle initial
    const Dashboard = lazy(() => import('@/components/Dashboard'));
    const TaskManager = lazy(() => import('@/components/TaskManager'));
    const ClientManager = lazy(() => import('@/components/ClientManager'));
    const CaseManager = lazy(() => import('@/components/CaseManager'));
    const Calendar = lazy(() => import('@/components/Calendar'));
    const Reports = lazy(() => import('@/components/Reports'));
    const TeamManager = lazy(() => import('@/components/TeamManager'));
    const DocumentManager = lazy(() => import('@/components/DocumentManager'));
    const BillingManager = lazy(() => import('@/components/BillingManagerMock'));
    const Settings = lazy(() => import('@/components/Settings'));

    function App() {
      const [activeView, setActiveView] = useState('dashboard');
      const { user, loading, signOut } = useAuth();

      const handleLogout = async () => {
        await signOut();
        setActiveView('dashboard');
      };

      const renderActiveView = () => {
        const loadingFallback = (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        );

        return (
          <Suspense fallback={loadingFallback}>
            {(() => {
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
            })()}
          </Suspense>
        );
      };

      if (loading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        );
      }

      if (!user) {
        return <NewLoginScreen />;
      }

      return (
        <>
          <Helmet>
            <title>LegalTask Pro - Cabinet d'Avocat</title>
            <meta name="description" content="Plateforme de gestion des tâches professionnelle pour cabinets d'avocats. Gérez vos dossiers, clients et échéances efficacement." />
          </Helmet>
          
          <div className="min-h-screen bg-cabinet-main print:bg-white">
            <div className="flex">
              <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                currentUser={user}
                onLogout={handleLogout}
              />
              
                            <main className="flex-1 print:ml-0">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-screen bg-transparent p-6 print:p-0 print:bg-white"
                >
                  {renderActiveView()}
                </motion.div>
              </main>
            </div>
            
            <Toaster />
          </div>
        </>
      );
    }

    export default App;
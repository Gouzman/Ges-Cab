import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3,
  Scale,
  Settings,
  Briefcase,
  LogOut,
  FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ activeView, setActiveView, currentUser, onLogout }) => {
  const isAssocieOrAdmin = currentUser && (currentUser.function === 'Associe Emerite' || (currentUser.role && currentUser.role.toLowerCase() === 'admin'));
  const isGerant = currentUser && currentUser.function === 'Gerant';
  const isSuperUser = isAssocieOrAdmin || isGerant;

  const hasPermission = (viewId) => {
    if (isSuperUser) return true;
    if (!currentUser?.permissions) return ['dashboard', 'tasks', 'calendar', 'documents'].includes(viewId);
    return currentUser.permissions[viewId]?.visible;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'cases', label: 'Dossiers', icon: FileText },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileArchive },
    { id: 'team', label: 'Collaborateurs', icon: Briefcase },
    { id: 'reports', label: 'Statistiques', icon: BarChart3 },
  ].filter(item => hasPermission(item.id));

  const settingsItem = { id: 'settings', label: 'Paramètres', icon: Settings };

  return (
    <motion.aside 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 flex flex-col"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-bordeaux-900 to-bordeaux-700 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tâche Cabinet</h1>
            <p className="text-sm text-slate-400">SCPA KERE-ASSOCIES</p>
          </div>
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto px-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-12 ${
                isActive 
                  ? 'bg-gradient-to-r from-bordeaux-900 to-bordeaux-700 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto p-6">
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <p className="text-white font-semibold truncate">{currentUser.name}</p>
          <p className="text-sm text-slate-400 capitalize">{currentUser.function || currentUser.role}</p>
        </div>
        
        {isAssocieOrAdmin && (
          <Button
            variant={activeView === settingsItem.id ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-12 mb-2 ${
              activeView === settingsItem.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => setActiveView(settingsItem.id)}
          >
            <settingsItem.icon className="w-5 h-5" />
            {settingsItem.label}
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-400 hover:bg-red-500/20"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
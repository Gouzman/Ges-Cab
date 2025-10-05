import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Users, 
  FileText, 
  Clock,
  AlertTriangle,
  Target,
  UserX,
  Megaphone,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Dashboard = ({ currentUser, setActiveView }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalClients: 0,
    activeCases: 0,
    urgentTasks: 0,
    todayDeadlines: 0
  });
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState('');

  const isGerantOrAssocie = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite');
  const isAdmin = isGerantOrAssocie || (currentUser.role && currentUser.role.toLowerCase() === 'admin');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all data for admins/managers
      let tasksQuery = supabase.from('tasks').select('*');
      let clientsQuery = supabase.from('clients').select('id', { count: 'exact' });
      let casesQuery = supabase.from('cases').select('status');
      
      // If not admin, fetch only user-specific data
      if (!isAdmin) {
        tasksQuery = tasksQuery.eq('assigned_to_id', currentUser.id);
      }

      const [
        { data: tasksData, error: tasksError },
        { count: clientsCount, error: clientsError },
        { data: casesData, error: casesError },
        { data: alertsData, error: alertsError }
      ] = await Promise.all([
        tasksQuery,
        isAdmin ? clientsQuery : Promise.resolve({ count: 0, error: null }),
        isAdmin ? casesQuery : Promise.resolve({ data: [], error: null }),
        supabase.from('alerts').select('*').order('created_at', { ascending: false })
      ]);

      if (tasksError || clientsError || casesError || alertsError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données du tableau de bord." });
      }

      setAlerts(alertsData || []);

      const tasks = tasksData || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();
      
      const urgentTasks = tasks.filter(task => task.priority === 'urgent' && task.status !== 'completed');
      const todayDeadlines = tasks.filter(task => {
        if (!task.deadline) return false;
        const deadlineDate = new Date(task.deadline);
        deadlineDate.setHours(0,0,0,0);
        return deadlineDate.getTime() === today.getTime();
      });
      const overdue = tasks.filter(task => 
        task.deadline && new Date(task.deadline) < now && task.status !== 'completed'
      );
      setOverdueTasks(overdue);

      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        totalClients: clientsCount || 0,
        activeCases: (casesData || []).filter(c => c.status === 'active').length,
        urgentTasks: urgentTasks.length,
        todayDeadlines: todayDeadlines.length
      });

      if (isAdmin) {
        const { data: membersData } = await supabase.from('profiles').select('*');
        const { data: allTasksData } = await supabase.from('tasks').select('assigned_to_id, status, deadline');
        
        const performance = (membersData || []).map(member => {
          const memberTasks = (allTasksData || []).filter(t => t.assigned_to_id === member.id);
          const completed = memberTasks.filter(t => t.status === 'completed').length;
          const overduePerf = memberTasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'completed').length;
          return {
            name: member.name,
            total: memberTasks.length,
            completed,
            overdue: overduePerf,
            completionRate: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0
          };
        });
        setTeamPerformance(performance);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, isAdmin]);

  const handlePostAlert = async () => {
    if (newAlert.trim() === '') return;
    const alert = {
      text: newAlert,
      author_id: currentUser.id,
      author_name: currentUser.name,
    };
    const { data, error } = await supabase.from('alerts').insert([alert]).select();
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de publier l'alerte." });
    } else {
      setAlerts([data[0], ...alerts]);
      setNewAlert('');
      toast({ title: "📢 Alerte publiée", description: "Votre message est visible par toute l'équipe." });
    }
  };

  const statCards = [
    { 
      title: 'Tâches Totales', 
      value: stats.totalTasks, 
      icon: CheckSquare, 
      color: 'from-sky-400 to-sky-500', 
      bgColor: 'bg-sky-50', 
      borderColor: 'border-sky-200',
      iconColor: 'text-sky-500',
      textColor: 'text-sky-700',
      view: 'tasks' 
    },
    { 
      title: 'Tâches Complétées', 
      value: stats.completedTasks, 
      icon: Target, 
      color: 'from-emerald-400 to-emerald-500', 
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-700',
      view: 'tasks' 
    },
    { 
      title: 'Clients Actifs', 
      value: stats.totalClients, 
      icon: Users, 
      color: 'from-violet-400 to-violet-500', 
      bgColor: 'bg-violet-50', 
      borderColor: 'border-violet-200',
      iconColor: 'text-violet-500',
      textColor: 'text-violet-700',
      adminOnly: true, 
      view: 'clients' 
    },
    { 
      title: 'Dossiers Actifs', 
      value: stats.activeCases, 
      icon: FileText, 
      color: 'from-indigo-400 to-indigo-500', 
      bgColor: 'bg-indigo-50', 
      borderColor: 'border-indigo-200',
      iconColor: 'text-indigo-500',
      textColor: 'text-indigo-700',
      adminOnly: true, 
      view: 'cases' 
    },
    { 
      title: 'Tâches Urgentes', 
      value: stats.urgentTasks, 
      icon: AlertTriangle, 
      color: 'from-rose-400 to-rose-500', 
      bgColor: 'bg-rose-50', 
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-700',
      view: 'tasks' 
    },
    { 
      title: 'Échéances Aujourd\'hui', 
      value: stats.todayDeadlines, 
      icon: Clock, 
      color: 'from-amber-400 to-amber-500', 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-700',
      view: 'calendar' 
    }
  ].filter(card => isAdmin || !card.adminOnly);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bordeaux-900 mb-2">Tableau de Bord</h1>
          <p className="text-bordeaux-600">Bonjour {currentUser.name || currentUser.email}, voici la vue d'ensemble de votre activité.</p>
        </div>
        <div className="text-right">
          <p className="text-bordeaux-600">Aujourd'hui</p>
          <p className="text-bordeaux-900 font-semibold">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveView(card.view)}
              className={`${card.bgColor} border-2 ${card.borderColor} rounded-2xl p-6 hover:scale-[1.02] hover:shadow-lg hover:shadow-${card.borderColor.replace('border-', '')}/20 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <h3 className="text-gray-600 font-medium text-sm">{card.title}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <UserX className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Tâches en Retard ({overdueTasks.length})</h3>
          </div>
          {overdueTasks.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <div>
                    <p className="text-gray-800 font-medium">{task.title}</p>
                    <p className="text-gray-500 text-sm">Assigné à: {task.assigned_to_name || 'Non assigné'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-rose-600 font-semibold text-sm px-2 py-1 bg-rose-100 rounded-md">Retard</p>
                    <p className="text-gray-500 text-xs mt-1">Échéance: {formatDate(task.deadline)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3">
                <CheckSquare className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-gray-600">Félicitations ! Aucune tâche en retard.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/90 backdrop-blur-sm border border-amber-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Megaphone className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Alertes Récentes</h3>
          </div>
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
                placeholder="Écrire une nouvelle alerte..."
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <Button size="icon" onClick={handlePostAlert} className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {alerts.length > 0 ? alerts.map(alert => (
              <div key={alert.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-gray-800 text-sm font-medium">{alert.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Par {alert.author_name} - {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )) : <p className="text-gray-500 text-center text-sm py-4">Aucune alerte pour le moment.</p>}
          </div>
        </motion.div>
      </div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur-sm border border-violet-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Users className="w-5 h-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Performance de l'Équipe</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-gray-600 font-semibold text-sm">Collaborateur</th>
                  <th className="p-4 text-gray-600 font-semibold text-sm text-center">Tâches Assignées</th>
                  <th className="p-4 text-gray-600 font-semibold text-sm text-center">Tâches Terminées</th>
                  <th className="p-4 text-gray-600 font-semibold text-sm text-center">En Retard</th>
                  <th className="p-4 text-gray-600 font-semibold text-sm text-center">Taux de Complétion</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map(member => (
                  <tr key={member.name} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{member.name}</td>
                    <td className="p-4 text-gray-700 text-center">{member.total}</td>
                    <td className="p-4 text-emerald-600 text-center font-semibold">{member.completed}</td>
                    <td className="p-4 text-rose-600 text-center font-semibold">{member.overdue}</td>
                    <td className="p-4 text-gray-700 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-semibold text-violet-600">{member.completionRate}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-violet-400 to-violet-500 h-2 rounded-full transition-all duration-300" style={{ width: `${member.completionRate}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

  const calculateTeamPerformance = (membersData, allTasksData, now) => {
    return (membersData || []).map(member => {
      const memberTasks = (allTasksData || []).filter(t => t.assigned_to_id === member.id);
      const completed = memberTasks.filter(t => t.status === 'completed').length;
      const overduePerf = memberTasks.filter(t => 
        t.deadline && new Date(t.deadline) < now && t.status !== 'completed'
      ).length;
      return {
        id: member.id, // Ajout de l'ID unique
        name: member.name,
        total: memberTasks.length,
        completed,
        overdue: overduePerf,
        completionRate: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all data for admins/managers
      let tasksQuery = supabase.from('tasks').select(`
        id, title, priority, status, deadline, assigned_to_id, case_id, 
        created_at, updated_at
      `);
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
        
        const performance = calculateTeamPerformance(membersData, allTasksData, now);
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
    { title: 'Tâches Totales', value: stats.totalTasks, icon: CheckSquare, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', view: 'tasks' },
    { title: 'Tâches Complétées', value: stats.completedTasks, icon: Target, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', view: 'tasks' },
    { title: 'Clients Actifs', value: stats.totalClients, icon: Users, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', adminOnly: true, view: 'clients' },
    { title: 'Dossiers Actifs', value: stats.activeCases, icon: FileText, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', adminOnly: true, view: 'cases' },
    { title: 'Tâches Urgentes', value: stats.urgentTasks, icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', view: 'tasks' },
    { title: 'Échéances Aujourd\'hui', value: stats.todayDeadlines, icon: Clock, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', view: 'calendar' }
  ].filter(card => isAdmin || !card.adminOnly);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord</h1>
          <p className="text-slate-400">Bonjour {currentUser.name || currentUser.email}, voici la vue d'ensemble de votre activité.</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400">Aujourd'hui</p>
          <p className="text-white font-semibold">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
              className={`${card.bgColor} backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${card.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <h3 className="text-slate-300 font-medium">{card.title}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Tâches en Retard ({overdueTasks.length})</h3>
          </div>
          {overdueTasks.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-slate-400 text-sm">Assigné à: {task.assigned_to_name || 'Non assigné'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-semibold">Retard</p>
                    <p className="text-slate-400 text-sm">Échéance: {formatDate(task.deadline)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-slate-300">Félicitations ! Aucune tâche en retard.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Alertes Récentes</h3>
          </div>
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
                placeholder="Écrire une nouvelle alerte..."
                className="flex-grow px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <Button size="icon" onClick={handlePostAlert} className="bg-yellow-500 hover:bg-yellow-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {alerts.length > 0 ? alerts.map(alert => (
              <div key={alert.id} className="p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-white text-sm">{alert.text}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Par {alert.author_name} - {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )) : <p className="text-slate-400 text-center text-sm py-4">Aucune alerte pour le moment.</p>}
          </div>
        </motion.div>
      </div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Performance de l'Équipe</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-3 text-slate-400 font-medium">Collaborateur</th>
                  <th className="p-3 text-slate-400 font-medium text-center">Tâches Assignées</th>
                  <th className="p-3 text-slate-400 font-medium text-center">Tâches Terminées</th>
                  <th className="p-3 text-slate-400 font-medium text-center">En Retard</th>
                  <th className="p-3 text-slate-400 font-medium text-center">Taux de Complétion</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map(member => (
                  <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                    <td className="p-3 text-white font-medium">{member.name}</td>
                    <td className="p-3 text-white text-center">{member.total}</td>
                    <td className="p-3 text-green-400 text-center">{member.completed}</td>
                    <td className="p-3 text-red-400 text-center">{member.overdue}</td>
                    <td className="p-3 text-white text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{member.completionRate}%</span>
                        <div className="w-24 bg-slate-600 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${member.completionRate}%` }}></div>
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

Dashboard.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    function: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  setActiveView: PropTypes.func.isRequired
};

export default Dashboard;
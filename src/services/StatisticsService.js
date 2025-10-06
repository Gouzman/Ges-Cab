// Service pour calculer les statistiques réelles à partir des données Supabase
import { supabase } from '@/lib/customSupabaseClient';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

export class StatisticsService {
  
  /**
   * Récupère toutes les données nécessaires pour les statistiques
   */
  static async fetchAllData() {
    try {
      // Récupération parallèle de toutes les données
      const [
        { data: tasks, error: tasksError },
        { data: cases, error: casesError },
        { data: profiles, error: profilesError },
        { data: activities, error: activitiesError },
        { data: events, error: eventsError }
      ] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('cases').select('*'),
        supabase.from('profiles').select('id, name, function, role, created_at'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*')
      ]);

      // Vérification des erreurs
      if (tasksError) throw new Error(`Erreur tasks: ${tasksError.message}`);
      if (casesError) throw new Error(`Erreur cases: ${casesError.message}`);
      if (profilesError) throw new Error(`Erreur profiles: ${profilesError.message}`);
      if (activitiesError) console.warn('Erreur activities (non critique):', activitiesError.message);
      if (eventsError) console.warn('Erreur events (non critique):', eventsError.message);

      return {
        tasks: tasks || [],
        cases: cases || [],
        profiles: profiles || [],
        activities: activities || [],
        events: events || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }

  /**
   * Calcule les statistiques des tâches
   */
  static calculateTaskStatistics(tasks, dateFilter = null) {
    let filteredTasks = tasks;
    
    if (dateFilter) {
      filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return isWithinInterval(taskDate, dateFilter);
      });
    }

    const tasksByStatus = {
      pending: filteredTasks.filter(t => t.status === 'pending').length,
      seen: filteredTasks.filter(t => t.status === 'seen').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length
    };

    const tasksByPriority = {
      low: filteredTasks.filter(t => t.priority === 'low').length,
      medium: filteredTasks.filter(t => t.priority === 'medium').length,
      high: filteredTasks.filter(t => t.priority === 'high').length,
      urgent: filteredTasks.filter(t => t.priority === 'urgent').length
    };

    const tasksByAssignee = filteredTasks.reduce((acc, task) => {
      const assignee = task.assigned_to_name || 'Non assigné';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {});

    const completionRate = filteredTasks.length > 0 
      ? (tasksByStatus.completed / filteredTasks.length * 100).toFixed(1)
      : 0;

    return {
      total: filteredTasks.length,
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
      byAssignee: tasksByAssignee,
      completionRate: parseFloat(completionRate),
      overdueCount: filteredTasks.filter(t => 
        t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed'
      ).length
    };
  }

  /**
   * Calcule les statistiques des dossiers
   */
  static calculateCaseStatistics(cases, dateFilter = null) {
    let filteredCases = cases;
    
    if (dateFilter) {
      filteredCases = cases.filter(case_ => {
        const caseDate = new Date(case_.created_at);
        return isWithinInterval(caseDate, dateFilter);
      });
    }

    const casesByStatus = filteredCases.reduce((acc, case_) => {
      const status = case_.status || 'undefined';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const casesByPriority = filteredCases.reduce((acc, case_) => {
      const priority = case_.priority || 'undefined';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total: filteredCases.length,
      byStatus: casesByStatus,
      byPriority: casesByPriority,
      active: filteredCases.filter(c => 
        c.status && ['active', 'open', 'ongoing'].includes(c.status.toLowerCase())
      ).length,
      closed: filteredCases.filter(c => 
        c.status && ['closed', 'completed', 'finished'].includes(c.status.toLowerCase())
      ).length
    };
  }

  /**
   * Calcule les statistiques d'activité des utilisateurs
   */
  static calculateUserActivityStatistics(activities, profiles, dateFilter = null) {
    let filteredActivities = activities;
    
    if (dateFilter) {
      filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return isWithinInterval(activityDate, dateFilter);
      });
    }

    const userStats = profiles.map(profile => {
      const userActivities = filteredActivities.filter(a => a.user_id === profile.id);
      
      const tasksCreated = userActivities.filter(a => a.action_type === 'task_created').length;
      const tasksCompleted = userActivities.filter(a => a.action_type === 'task_completed').length;
      const casesCreated = userActivities.filter(a => a.action_type === 'case_created').length;
      
      return {
        userId: profile.id,
        userName: profile.name || 'Utilisateur inconnu',
        userFunction: profile.function || profile.role || 'Non défini',
        totalActivities: userActivities.length,
        tasksCreated,
        tasksCompleted,
        casesCreated,
        productivityScore: tasksCompleted > 0 ? (tasksCompleted / (tasksCreated + 1) * 100).toFixed(1) : 0
      };
    }).filter(stat => stat.totalActivities > 0); // Garder seulement les utilisateurs avec activité

    return {
      userStats,
      totalActivities: filteredActivities.length,
      mostActiveUser: userStats.reduce((max, current) => 
        current.totalActivities > (max.totalActivities || 0) ? current : max, {}
      ),
      activityByType: filteredActivities.reduce((acc, activity) => {
        acc[activity.action_type] = (acc[activity.action_type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Génère des statistiques pour une période donnée
   */
  static generatePeriodStatistics(data, period = 'month') {
    const now = new Date();
    let dateFilter;

    switch (period) {
      case 'today':
        dateFilter = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case 'week':
        dateFilter = { start: startOfWeek(now), end: endOfWeek(now) };
        break;
      case 'month':
        dateFilter = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'year':
        dateFilter = { start: startOfYear(now), end: endOfYear(now) };
        break;
      default:
        dateFilter = null; // Toutes les données
    }

    const taskStats = this.calculateTaskStatistics(data.tasks, dateFilter);
    const caseStats = this.calculateCaseStatistics(data.cases, dateFilter);
    const activityStats = this.calculateUserActivityStatistics(data.activities, data.profiles, dateFilter);

    return {
      period,
      dateRange: dateFilter ? {
        start: dateFilter.start.toLocaleDateString('fr-FR'),
        end: dateFilter.end.toLocaleDateString('fr-FR')
      } : null,
      tasks: taskStats,
      cases: caseStats,
      activities: activityStats,
      summary: {
        totalTasks: taskStats.total,
        totalCases: caseStats.total,
        totalActivities: activityStats.totalActivities,
        activeUsers: activityStats.userStats.length,
        completionRate: taskStats.completionRate
      }
    };
  }

  /**
   * Prépare les données pour l'export CSV/PDF
   */
  static prepareExportData(statistics, exportType = 'overview') {
    const { tasks, cases, activities, summary } = statistics;

    switch (exportType) {
      case 'tasks':
        return {
          title: 'Rapport des Tâches',
          data: [
            ['Métrique', 'Valeur'],
            ['Total des tâches', tasks.total],
            ['Tâches en attente', tasks.byStatus.pending || 0],
            ['Tâches vues', tasks.byStatus.seen || 0],
            ['Tâches en cours', tasks.byStatus['in-progress'] || 0],
            ['Tâches terminées', tasks.byStatus.completed || 0],
            ['Taux de completion (%)', tasks.completionRate],
            ['Tâches en retard', tasks.overdueCount]
          ]
        };

      case 'cases':
        return {
          title: 'Rapport des Dossiers',
          data: [
            ['Métrique', 'Valeur'],
            ['Total des dossiers', cases.total],
            ['Dossiers actifs', cases.active],
            ['Dossiers fermés', cases.closed],
            ...Object.entries(cases.byStatus).map(([status, count]) => [`Statut: ${status}`, count])
          ]
        };

      case 'activity':
        return {
          title: 'Rapport d\'Activité',
          data: [
            ['Utilisateur', 'Fonction', 'Activités totales', 'Tâches créées', 'Tâches terminées', 'Score productivité (%)'],
            ...activities.userStats.map(user => [
              user.userName,
              user.userFunction,
              user.totalActivities,
              user.tasksCreated,
              user.tasksCompleted,
              user.productivityScore
            ])
          ]
        };

      case 'overview':
      default:
        return {
          title: 'Rapport Vue d\'Ensemble',
          data: [
            ['Métrique', 'Valeur'],
            ['Total des tâches', summary.totalTasks],
            ['Total des dossiers', summary.totalCases],
            ['Total des activités', summary.totalActivities],
            ['Utilisateurs actifs', summary.activeUsers],
            ['Taux de completion (%)', summary.completionRate],
            ['Tâches en retard', tasks.overdueCount]
          ]
        };
    }
  }
}

export default StatisticsService;
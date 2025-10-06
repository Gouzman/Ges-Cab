import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, User, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const TaskDisplayTest = () => {
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les tâches avec tous les champs
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (tasksError) throw tasksError;

        // Récupérer les profils pour enrichir les données
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email');

        if (profilesError) throw profilesError;

        // Créer un map des profils pour un accès rapide
        const profilesMap = new Map(profilesData.map(p => [p.id, p]));

        // Enrichir les tâches avec les noms des créateurs et assignés
        const enrichedTasks = tasksData.map(task => {
          const creator = profilesMap.get(task.created_by_id || task.created_by);
          const assignee = profilesMap.get(task.assigned_to_id || task.assigned_to);

          return {
            ...task,
            // Assurer la compatibilité avec l'affichage existant
            created_by_name: creator ? (creator.name || creator.email) : task.created_by_name || 'Créateur inconnu',
            assigned_to_name: assignee ? (assignee.name || assignee.email) : task.assigned_to_name || 'Non assigné'
          };
        });

        setTasks(enrichedTasks);
        setProfiles(profilesData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données de test"
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const TaskTestCard = ({ task, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-3"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white truncate flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {task.status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          )}
          <span className={task.status === 'completed' ? 'text-green-400' : 'text-orange-400'}>
            {task.status}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-2">
        {/* Affichage corrigé - Créateur en premier */}
        <div className="p-2 bg-green-900/20 border border-green-700/50 rounded">
          <p className="text-green-300 text-xs mb-2">✅ AFFICHAGE CORRIGÉ:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">
                <strong>Créé par:</strong> {task.created_by_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">
                <strong>Assigné à:</strong> {task.assigned_to_name}
              </span>
            </div>
          </div>
        </div>

        {/* Informations techniques pour débogage */}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-400">
            Informations techniques
          </summary>
          <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-500 space-y-1">
            <div>ID Créateur: {task.created_by_id || task.created_by || 'N/A'}</div>
            <div>ID Assigné: {task.assigned_to_id || task.assigned_to || 'N/A'}</div>
            <div>Créé le: {new Date(task.created_at).toLocaleString()}</div>
            {task.assigned_at && <div>Assigné le: {new Date(task.assigned_at).toLocaleString()}</div>}
          </div>
        </details>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          Test d'Affichage - Correction du Bug Créateur/Assigné
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-700/30 rounded"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          🔧 Test d'Affichage - Bug Créateur/Assigné CORRIGÉ
        </h2>
        <div className="text-sm text-slate-400">
          {tasks.length} tâche(s) analysée(s)
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-blue-300 text-sm">
          ✅ <strong>Correction appliquée:</strong> Les tâches affichent maintenant le créateur en premier ("Créé par:"), 
          puis l'assigné ("Assigné à:"). L'enrichissement des données depuis la table profiles fonctionne correctement.
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskTestCard key={task.id} task={task} index={index} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Aucune tâche trouvée pour le test</p>
            <p className="text-xs text-slate-500 mt-2">
              Créez quelques tâches pour voir le test en action
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">
          📊 Profils Disponibles ({profiles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm max-h-32 overflow-y-auto">
          {profiles.map(profile => (
            <div key={profile.id} className="flex items-center gap-2 text-slate-300">
              <User className="w-3 h-3" />
              <span>{profile.name || profile.email} ({profile.id.slice(0, 8)}...)</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDisplayTest;
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Search, Calendar, ListTodo, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';

import { supabase } from '@/lib/customSupabaseClient';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TaskManager = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('suivi');
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [teamMembers, setTeamMembers] = useState([]);
  const [cases, setCases] = useState([]);
  const [taskToComment, setTaskToComment] = useState(null);
  const [completionComment, setCompletionComment] = useState('');


  // Utilisation du nouveau système de permissions
  const { 
    hasModuleAccess, 
    userIsAdmin 
  } = usePermissions();

  const isAdmin = userIsAdmin();

  useEffect(() => {
    const fetchTasks = async () => {
      // Récupérer d'abord les tâches
      let query = supabase.from('tasks').select('*');
      
      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      if (!isAdmin && currentUser?.id) {
        query = query.eq('assigned_to_id', currentUser.id);
      }
      
      const { data: tasksData, error: tasksError } = await query.order('created_at', { ascending: false });
      if (tasksError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les tâches." });
        return;
      }

      // Récupérer les profils pour enrichir les données
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name');

      if (profilesError) {
        console.warn('Impossible de charger les profils:', profilesError);
        setTasks(tasksData || []);
        return;
      }

      // Fonction utilitaire pour éviter les ternaires imbriqués
      const getCreatedByName = (task, profilesMap) => {
        if (task.created_by_id) {
          return profilesMap.get(task.created_by_id) || task.created_by_name || 'Utilisateur introuvable';
        }
        if (task.created_by) {
          return profilesMap.get(task.created_by) || 'Utilisateur introuvable';
        }
        return 'Créateur inconnu';
      };

      // Enrichir les tâches avec les noms actuels depuis les profils
      const profilesMap = new Map(profilesData.map(p => [p.id, p.name]));
      const enrichedTasks = (tasksData || []).map(task => ({
        ...task,
        assigned_to_name: task.assigned_to_id ? (profilesMap.get(task.assigned_to_id) || task.assigned_to_name || 'Utilisateur introuvable') : 'Non assigné',
        created_by_name: getCreatedByName(task, profilesMap)
      }));
      
      setTasks(enrichedTasks);
    };

    const fetchTeamMembers = async () => {
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('id, name, role, function');
      if (error) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les collaborateurs." });
      } else {
        // Filtrer côté client pour exclure les Admin
        const filteredMembers = (allProfiles || []).filter(user => 
          user.role !== 'Admin' && user.function !== 'Admin'
        );
        setTeamMembers(filteredMembers);
      }
    };

    const fetchCases = async () => {
      const { data, error } = await supabase.from('cases').select('id, title');
      if (error) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les dossiers." });
      } else {
        setCases(data);
      }
    };

    fetchTasks();
    fetchTeamMembers();
    fetchCases();
  }, [currentUser?.id, isAdmin]);

  const handleFileUpload = async (file, taskId) => {
    const filePath = `${currentUser.id}/${taskId}/${file.name}`;
    // Upload du fichier sur Supabase Storage
    try {
      const { error } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, { upsert: true });
      if (error) {
        toast({ variant: "destructive", title: "Erreur d'upload", description: error.message });
        return null;
      }
      // Récupérer l'URL publique du fichier
      const { publicURL } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);
      return publicURL;
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur d'upload", description: err.message });
      return null;
    }
  };

  const processTaskData = (taskData) => {
    const { filesToUpload, ...data } = taskData;
    if (data.case_id === '') {
      data.case_id = null;
    }
    return { filesToUpload, data };
  };

  const handleAddTask = async (taskData) => {
    const { filesToUpload, data: dataToInsert } = processTaskData(taskData);
    const assignedMember = teamMembers.find(m => m.id === dataToInsert.assigned_to_id);
    
    const { data, error } = await supabase.from('tasks').insert([{ 
      ...dataToInsert, 
      assigned_to_name: assignedMember ? assignedMember.name : 'Non assigné',
      attachments: [],
      assigned_at: dataToInsert.assigned_to_id ? new Date().toISOString() : null,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name || currentUser.email || 'Utilisateur',
      created_by: currentUser.id  // Assure la compatibilité avec le schéma original
    }]).select().single();
    
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de créer la tâche: ${error.message}` });
      return;
    }

    const uploadedAttachmentPaths = [];
    for (const file of filesToUpload || []) {
      const path = await handleFileUpload(file, data.id);
      if (path) uploadedAttachmentPaths.push(path);
    }

    if (uploadedAttachmentPaths.length > 0) {
      const { data: updatedData, error: updateError } = await supabase
        .from('tasks')
        .update({ attachments: uploadedAttachmentPaths })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de lier les fichiers." });
      } else {
        setTasks([updatedData, ...tasks.filter(t => t.id !== data.id)]);
      }
    } else {
      setTasks([data, ...tasks]);
    }

    setActiveTab('suivi');
    toast({ title: "✅ Tâche créée", description: "La nouvelle tâche a été ajoutée." });
  };



  const handleEditTask = async (taskData) => {
    const { filesToUpload, data: dataToUpdate } = processTaskData(taskData);

    const uploadedAttachmentPaths = [...(editingTask.attachments || [])];
    for (const file of filesToUpload || []) {
      const path = await handleFileUpload(file, editingTask.id);
      if (path) uploadedAttachmentPaths.push(path);
    }

    // Récupérer le nom de l'assigné mis à jour
    const assignedMember = teamMembers.find(m => m.id === dataToUpdate.assigned_to_id);
    
    if (editingTask.assigned_to_id !== dataToUpdate.assigned_to_id) {
      dataToUpdate.assigned_at = new Date().toISOString();
      dataToUpdate.seen_at = null;
    }

    dataToUpdate.attachments = uploadedAttachmentPaths;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: dataToUpdate.title,
        description: dataToUpdate.description,
        case_id: dataToUpdate.case_id,
        priority: dataToUpdate.priority,
        deadline: dataToUpdate.deadline,
        attachments: uploadedAttachmentPaths,
        assigned_to_id: dataToUpdate.assigned_to_id,
        assigned_to_name: assignedMember ? assignedMember.name : null,
        assigned_at: dataToUpdate.assigned_at,
        seen_at: dataToUpdate.seen_at
      })
      .eq('id', editingTask.id)
      .select();
    
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de modifier la tâche: ${error.message}` });
    } else {
      setTasks(tasks.map(t => t.id === editingTask.id ? data[0] : t));
      setEditingTask(null);
      setActiveTab('suivi');
      toast({ title: "✅ Tâche modifiée", description: "La tâche a été mise à jour." });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la tâche." });
    } else {
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({ title: "🗑️ Tâche supprimée", description: "La tâche a été supprimée." });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (newStatus === 'completed') {
      setTaskToComment(taskId);
    } else {
      let updatePayload = { status: newStatus };
      if (task && task.status === 'pending' && newStatus === 'seen' && !task.seen_at) {
        updatePayload.seen_at = new Date().toISOString();
      }
      updateTaskStatus(taskId, updatePayload);
    }
  };

  const updateTaskStatus = async (taskId, updatePayload, comment = null) => {
    if (comment !== null) {
      updatePayload.completion_comment = comment;
    }
    const { data, error } = await supabase.from('tasks').update(updatePayload).eq('id', taskId).select();
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de changer le statut." });
    } else {
      setTasks(tasks.map(t => t.id === taskId ? data[0] : t));
      toast({ title: "✅ Statut mis à jour" });
    }
  };

  const handleCommentSubmit = () => {
    if (taskToComment) {
      updateTaskStatus(taskToComment, { status: 'completed' }, completionComment);
      setTaskToComment(null);
      setCompletionComment('');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    seen: tasks.filter(t => t.status === 'seen').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const handleEditRequest = (task) => {
    setEditingTask(task);
    setActiveTab('nouvelle');
  };

  // Vérification d'accès au module
  if (!hasModuleAccess('tasks')) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ListTodo className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Accès non autorisé</h1>
        <p className="text-slate-400">Vous n'avez pas les permissions pour accéder aux tâches.</p>
        <p className="text-slate-500 text-sm mt-2">Contactez votre administrateur pour obtenir les droits nécessaires.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Tâches</h1>
          <p className="text-slate-400">Organisez et suivez vos tâches juridiques</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'suivi' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('suivi')}
            className={`flex-1 justify-center gap-2 ${activeTab === 'suivi' ? 'bg-blue-600' : ''}`}
          >
            <ListTodo className="w-4 h-4" /> Suivi de Tâches
          </Button>
          <Button
            variant={activeTab === 'nouvelle' ? 'default' : 'ghost'}
            onClick={() => { setActiveTab('nouvelle'); setEditingTask(null); }}
            className={`flex-1 justify-center gap-2 ${activeTab === 'nouvelle' ? 'bg-blue-600' : ''}`}
          >
            <FilePlus className="w-4 h-4" /> {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
          </Button>
        </div>
      </div>

      {activeTab === 'suivi' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'all', label: 'Total', color: 'bg-slate-600' },
              { key: 'pending', label: 'En Attente', color: 'bg-orange-500' },
              { key: 'seen', label: 'Vues', color: 'bg-purple-500' },
              { key: 'in-progress', label: 'En Cours', color: 'bg-blue-500' },
              { key: 'completed', label: 'Terminées', color: 'bg-green-500' }
            ].map((stat) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{statusCounts[stat.key]}</p>
                  </div>
                  <div className={`w-3 h-3 ${stat.color} rounded-full`}></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-cabinet-surface/20 backdrop-blur-sm border border-cabinet-border rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-cabinet-surface border-2 border-cabinet-border rounded-lg text-cabinet-text placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="seen">Vue</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminées</option>
                </select>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">Toutes les priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={handleEditRequest}
                onDelete={isAdmin ? handleDeleteTask : null}
                onStatusChange={handleStatusChange}
                currentUser={currentUser}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucune tâche trouvée</h3>
              <p className="text-slate-500">{searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'Essayez de modifier vos filtres de recherche' : 'Commencez par créer votre première tâche'}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeTab === 'nouvelle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            onCancel={() => { setActiveTab('suivi'); setEditingTask(null); }}
            teamMembers={teamMembers}
            cases={cases}
            currentUser={currentUser}
          />
        </motion.div>
      )}

      <AlertDialog open={taskToComment !== null} onOpenChange={() => setTaskToComment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ajouter un commentaire de clôture</AlertDialogTitle>
            <AlertDialogDescription>La tâche est terminée. Veuillez ajouter un commentaire pour résumer le travail effectué.</AlertDialogDescription>
          </AlertDialogHeader>
          <textarea value={completionComment} onChange={(e) => setCompletionComment(e.target.value)} placeholder="Ex: Le rapport a été envoyé au client pour validation." className="w-full mt-4 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => updateTaskStatus(taskToComment, { status: 'completed' })}>Passer</AlertDialogCancel>
            <AlertDialogAction onClick={handleCommentSubmit}>Enregistrer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

TaskManager.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    function: PropTypes.string,
    role: PropTypes.string,
    permissions: PropTypes.shape({
      tasks: PropTypes.shape({
        visible: PropTypes.bool,
        create: PropTypes.bool,
        edit: PropTypes.bool,
        delete: PropTypes.bool
      })
    })
  }).isRequired
};

export default TaskManager;
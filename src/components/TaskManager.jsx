import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Search, Calendar, ListTodo, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import { api } from "@/lib/api";
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

  const isGerantOrAssocie = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite');
  const isAdmin = isGerantOrAssocie || (currentUser.role && currentUser.role.toLowerCase() === 'admin');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.tasks.getAll();
        // Filter tasks if user is not admin
        const filteredTasks = !isAdmin && currentUser?.id 
          ? data.filter(task => task.assigned_to_id === currentUser.id)
          : data;
        setTasks(filteredTasks);
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Erreur", 
          description: "Impossible de charger les tâches." 
        });
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const data = await api.team.getAll();
        setTeamMembers(data);
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Erreur", 
          description: "Impossible de charger les collaborateurs." 
        });
      }
    };

    const fetchCases = async () => {
      try {
        const data = await api.cases.getAll();
        setCases(data);
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Erreur", 
          description: "Impossible de charger les dossiers." 
        });
      }
    };

    fetchTasks();
    fetchTeamMembers();
    fetchCases();
  }, [currentUser?.id, isAdmin]);

  const handleFileUpload = async (file, taskId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      formData.append('userId', currentUser.id);
      
      const response = await api.tasks.uploadFile(formData);
      return response.fileUrl;
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur d'upload", 
        description: error.message 
      });
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
    try {
      const { filesToUpload, data: taskToCreate } = processTaskData(taskData);
      const assignedMember = teamMembers.find(m => m.id === taskToCreate.assigned_to_id);
      
      const taskWithMetadata = {
        ...taskToCreate,
        assigned_to_name: assignedMember?.name || null,
        attachments: [],
        assigned_at: taskToCreate.assigned_to_id ? new Date().toISOString() : null,
        created_by_id: currentUser.id,
        created_by_name: currentUser.name
      };

      // Créer la tâche
      const newTask = await api.tasks.create(taskWithMetadata);

      // Gérer les pièces jointes
      if (filesToUpload?.length > 0) {
        const attachmentPaths = [];
        for (const file of filesToUpload) {
          const path = await handleFileUpload(file, newTask.id);
          if (path) attachmentPaths.push(path);
        }

        if (attachmentPaths.length > 0) {
          const updatedTask = await api.tasks.update(newTask.id, {
            ...newTask,
            attachments: attachmentPaths
          });
          setTasks([updatedTask, ...tasks.filter(t => t.id !== newTask.id)]);
        } else {
          setTasks([newTask, ...tasks]);
        }
      } else {
        setTasks([newTask, ...tasks]);
      }

      setActiveTab('suivi');
      toast({ 
        title: "✅ Tâche créée", 
        description: "La nouvelle tâche a été ajoutée." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: `Impossible de créer la tâche: ${error.message}` 
      });
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const { filesToUpload, data: dataToUpdate } = processTaskData(taskData);
      const assignedMember = teamMembers.find(m => m.id === dataToUpdate.assigned_to_id);

      // Gérer les pièces jointes existantes et nouvelles
      const attachments = [...(editingTask.attachments || [])];
      if (filesToUpload?.length > 0) {
        for (const file of filesToUpload) {
          const path = await handleFileUpload(file, editingTask.id);
          if (path) attachments.push(path);
        }
      }

      // Mettre à jour les métadonnées si l'assignation change
      if (editingTask.assigned_to_id !== dataToUpdate.assigned_to_id) {
        dataToUpdate.assigned_at = new Date().toISOString();
        dataToUpdate.seen_at = null;
        dataToUpdate.assigned_to_name = assignedMember?.name || null;
      }

      // Mettre à jour la tâche avec toutes les données
      const updatedTask = await api.tasks.update(editingTask.id, {
        ...dataToUpdate,
        attachments
      });

      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      setActiveTab('suivi');
      toast({ 
        title: "✅ Tâche modifiée", 
        description: "La tâche a été mise à jour." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: `Impossible de modifier la tâche: ${error.message}` 
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.tasks.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({ 
        title: "🗑️ Tâche supprimée", 
        description: "La tâche a été supprimée." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Impossible de supprimer la tâche." 
      });
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
    try {
      if (comment !== null) {
        updatePayload.completion_comment = comment;
      }
      
      const updatedTask = await api.tasks.update(taskId, updatePayload);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast({ title: "✅ Statut mis à jour" });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Impossible de changer le statut." 
      });
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

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Calendar, FileText, User, Paperclip, RefreshCw, Download, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { taskCategoriesData } from '@/lib/taskCategories';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const TaskForm = ({ task, onSubmit, onCancel, teamMembers, cases, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    assigned_to_id: '',
    case_id: '',
    main_category: '',
    associated_tasks: [],
    attachments: [],
    filesToUpload: []
  });
  const [showReassign, setShowReassign] = useState(false);
  const [availableSubTasks, setAvailableSubTasks] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 16) : '',
        assigned_to_id: task.assigned_to_id || '',
        case_id: task.case_id || '',
        main_category: '', // ✅ Toujours vide - fonctionnalité locale uniquement
        associated_tasks: [], // ✅ Toujours initialisé vide - fonctionnalité locale
        attachments: task.attachments || [],
        filesToUpload: []
      });
      // ✅ main_category géré localement - pas de données depuis la base
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'main_category') {
      const category = taskCategoriesData.find(c => c.name === value);
      setAvailableSubTasks(category ? category.tasks : []);
      setFormData(prev => ({ ...prev, associated_tasks: [] }));
    }
  };

  const handleSubTaskChange = (subTask) => {
    setFormData(prev => {
      const newAssociatedTasks = prev.associated_tasks.includes(subTask)
        ? prev.associated_tasks.filter(st => st !== subTask)
        : [...prev.associated_tasks, subTask];
      return { ...prev, associated_tasks: newAssociatedTasks };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        filesToUpload: [...prev.filesToUpload, ...newFiles]
      }));
      toast({
        title: `📎 ${newFiles.length} fichier(s) ajouté(s)`,
        description: `Prêt(s) à être téléversé(s) lors de la sauvegarde.`,
      });
      e.target.value = '';
    }
  };

  const handleDownload = async (filePath) => {
    const { data, error } = await supabase.storage.from('attachments').download(filePath);
    if (error) {
      toast({ variant: "destructive", title: "Erreur de téléchargement", description: error.message });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScan = () => {
    toast({
      title: "🚧 Fonctionnalité non implémentée",
      description: "La numérisation directe n'est pas encore disponible. Vous pouvez demander cette fonctionnalité dans votre prochain prompt ! 🚀",
    });
  };

  const isGerantOrAssocie = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite');
  const isAdmin = isGerantOrAssocie || (currentUser.role && currentUser.role.toLowerCase() === 'admin');
  const canReassign = task && (task.assigned_to_id === currentUser.id || isAdmin);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {task ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-2">
              Titre de la tâche *
            </label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Préparer les conclusions pour l'affaire Martin"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="task-main-category" className="block text-sm font-medium text-slate-300 mb-2">
                Catégorie Principale
              </label>
              <select
                id="task-main-category"
                name="main_category"
                value={formData.main_category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {taskCategoriesData.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-associated-tasks" className="block text-sm font-medium text-slate-300 mb-2">
                Tâches Associées
              </label>
              <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg max-h-40 overflow-y-auto">
                {availableSubTasks.length > 0 ? (
                  availableSubTasks.map(subTask => (
                    <div key={subTask} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={subTask}
                        checked={formData.associated_tasks.includes(subTask)}
                        onCheckedChange={() => handleSubTaskChange(subTask)}
                      />
                      <Label htmlFor={subTask} className="text-slate-300 font-normal">{subTask}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">Sélectionnez d'abord une catégorie principale.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-slate-300 mb-2">
                Priorité
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Faible</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Élevée</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-slate-300 mb-2">
                Statut
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">En attente</option>
                <option value="seen">Vue</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="task-deadline" className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Échéance
              </label>
              <input
                id="task-deadline"
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="task-case" className="block text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Dossier
              </label>
              <select
                id="task-case"
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun dossier</option>
                {cases?.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-assigned-to" className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Assigné à
            </label>
            <select
              id="task-assigned-to"
              name="assigned_to_id"
              value={formData.assigned_to_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isAdmin && !showReassign && task && task.assigned_to_id !== currentUser.id}
            >
              <option value="">Non assigné</option>
              {teamMembers?.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          
          {canReassign && !isAdmin && !showReassign && (
            <Button type="button" variant="outline" onClick={() => setShowReassign(true)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Réassigner la tâche
            </Button>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Paperclip className="w-4 h-4 inline mr-2" />
              Pièces jointes
            </label>
            <div className="flex items-center gap-4">
              <label htmlFor="file-upload" className="cursor-pointer bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                Choisir des fichiers
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
              <Button type="button" variant="outline" onClick={handleScan} className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                <ScanLine className="w-4 h-4" />
                Numériser
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {formData.attachments.map((path, index) => (
                <div key={`attachment-${path}-${index}`} className="flex items-center justify-between text-sm text-slate-400 bg-slate-700/30 p-2 rounded-md">
                  <span>{path.split('/').pop()}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(path)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.filesToUpload.map((file, index) => (
                <div key={`file-${file.name}-${index}`} className="text-sm text-green-400 bg-green-900/30 p-2 rounded-md">{file.name} (nouveau)</div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {task ? 'Mettre à jour' : 'Créer la tâche'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Annuler
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

TaskForm.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    deadline: PropTypes.string,
    assigned_to_id: PropTypes.string,
    case_id: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.string)
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  teamMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    map: PropTypes.func
  })),
  cases: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    map: PropTypes.func
  })),
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    function: PropTypes.string,
    role: PropTypes.string
  }).isRequired
};

export default TaskForm;
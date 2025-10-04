import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, FileText, User, Paperclip, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const TaskForm = ({ task, onSubmit, onCancel, teamMembers, cases, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    assigned_to_id: '',
    case_id: '',
    category: 'general',
    attachments: [],
    filesToUpload: []
  });
  const [showReassign, setShowReassign] = useState(false);

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
        category: task.category || 'general',
        attachments: task.attachments || [],
        filesToUpload: []
      });
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

  const categories = [
    { value: 'general', label: 'Général' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'research', label: 'Recherche' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'court', label: 'Tribunal' },
    { value: 'meeting', label: 'Réunion' },
    { value: 'deadline', label: 'Échéance' }
  ];

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
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre de la tâche *
            </label>
            <input
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
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priorité
              </label>
              <select
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Statut
              </label>
              <select
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Échéance
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Assigné à
              </label>
              <select
                name="assigned_to_id"
                value={formData.assigned_to_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isAdmin && !showReassign && task && task.assigned_to_id !== currentUser.id}
              >
                <option value="">Non assigné</option>
                {teamMembers && teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Dossier
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun dossier</option>
                {cases && cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
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
              <label htmlFor="file-upload" className="cursor-pointer bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-700">
                Choisir des fichiers
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
            </div>
            <div className="mt-2 space-y-2">
              {formData.attachments.map((path, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-slate-400 bg-slate-700/30 p-2 rounded-md">
                  <span>{path.split('/').pop()}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(path)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.filesToUpload.map((file, index) => (
                <div key={index} className="text-sm text-green-400 bg-green-900/30 p-2 rounded-md">{file.name} (nouveau)</div>
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

export default TaskForm;
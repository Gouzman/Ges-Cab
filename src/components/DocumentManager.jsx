import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileArchive, Search, Printer, Eye, Trash2, Timer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';    const DocumentManager = ({ currentUser }) => {
      const [documents, setDocuments] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [profile, setProfile] = useState(null);

      const isAdmin = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite' || (currentUser.role && currentUser.role.toLowerCase() === 'admin'));

      useEffect(() => {
        const fetchProfile = async () => {
          const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
          setProfile(data);
        };
        fetchProfile();
      }, [currentUser]);

      useEffect(() => {
        const fetchDocuments = async () => {
          let query = supabase.from('tasks').select('id, title, updated_at, attachments');
          if (!isAdmin) {
            query = query.eq('assigned_to_id', currentUser.id);
          }
          const { data: tasks, error } = await query;

          if (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les documents." });
            return;
          }
          
          const allDocs = (tasks || []).flatMap(task => 
            (task.attachments || []).map(attachmentPath => ({
              id: `${task.id}-${attachmentPath}`,
              name: attachmentPath.split('/').pop(),
              path: attachmentPath,
              taskTitle: task.title,
              taskId: task.id,
              date: task.updated_at,
              timeSpent: 0, // time_spent géré comme propriété locale
            }))
          );
          setDocuments(allDocs);
        };

        if (profile) {
          fetchDocuments();
        }
      }, [currentUser, profile, isAdmin]);

      const handleDownload = async (path, name) => {
        const { data, error } = await supabase.storage.from('attachments').download(path);
        if (error) {
          toast({ variant: "destructive", title: "Erreur de téléchargement", description: error.message });
          return;
        }
        const blob = new Blob([data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        if (document.body) {
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      };

      const handlePreview = async (path) => {
        const { data } = supabase.storage.from('attachments').getPublicUrl(path);
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        } else {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer un aperçu." });
        }
      };

      const handleDelete = async (doc) => {
        const { error: storageError } = await supabase.storage.from('attachments').remove([doc.path]);
        if (storageError) {
          toast({ variant: "destructive", title: "Erreur de suppression du fichier", description: storageError.message });
          return;
        }

        const { data: taskData } = await supabase.from('tasks').select('attachments').eq('id', doc.taskId).single();
        const updatedAttachments = (taskData.attachments || []).filter(p => p !== doc.path);
        
        const { error: dbError } = await supabase.from('tasks').update({ attachments: updatedAttachments }).eq('id', doc.taskId);
        if (dbError) {
          toast({ variant: "destructive", title: "Erreur de mise à jour de la tâche", description: dbError.message });
        } else {
          setDocuments(documents.filter(d => d.id !== doc.id));
          toast({ title: "🗑️ Document supprimé", description: `${doc.name} a été supprimé.` });
        }
      };

      const filteredDocuments = documents.filter(doc =>
        (doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.taskTitle && doc.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestion des Documents</h1>
              <p className="text-slate-400">Retrouvez tous les fichiers liés à vos tâches</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un document par nom ou par tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-4 text-slate-300 font-medium">Nom du Fichier</th>
                  <th className="p-4 text-slate-300 font-medium">Tâche Associée</th>
                  <th className="p-4 text-slate-300 font-medium">Temps Passé (h)</th>
                  <th className="p-4 text-slate-300 font-medium">Date d'ajout</th>
                  <th className="p-4 text-slate-300 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800 hover:bg-slate-700/20"
                  >
                    <td className="p-4 text-white font-medium">{doc.name}</td>
                    <td className="p-4 text-slate-400">{doc.taskTitle}</td>
                    <td className="p-4 text-slate-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-500" />
                      {doc.timeSpent}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(doc.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handlePreview(doc.path)} title="Aperçu"><Eye className="w-4 h-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.path, doc.name)} title="Télécharger"><Download className="w-4 h-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} title="Supprimer"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileArchive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucun document trouvé</h3>
                <p className="text-slate-500">Les fichiers que vous joignez aux tâches apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    export default DocumentManager;
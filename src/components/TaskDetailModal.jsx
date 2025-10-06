import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  UserCheck,
  Paperclip,
  Download,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useTaskViewed } from '@/hooks/useTaskViewed';

const TaskDetailModal = ({ task, onClose, onEdit, currentUser, onTaskUpdate }) => {
  // Marquer automatiquement la tâche comme vue si l'utilisateur est l'assigné
  const { isViewed, viewedAt } = useTaskViewed(task, currentUser, onTaskUpdate);

  if (!task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Terminée' };
      case 'in-progress':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'En cours' };
      case 'seen':
        return { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Vue' };
      default:
        return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'En attente' };
    }
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;
  const isAssignee = task.assigned_to_id === currentUser?.id;
  const isCreator = task.created_by_id === currentUser?.id;
  const canEdit = isAssignee || isCreator || currentUser?.role === 'admin';

  const handleDownload = (attachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = (attachment) => {
    if (attachment.url) {
      const printWindow = window.open(attachment.url, '_blank');
      if (printWindow) {
        printWindow.onload = function() {
          printWindow.print();
        };
      }
    }
  };  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </div>
              {isViewed && viewedAt && (
                <div className="text-xs text-purple-300">
                  Vue le {formatDate(viewedAt)}
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Auto-viewed notification for assignee */}
        {isAssignee && task.status === 'seen' && (
          <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Eye className="w-4 h-4" />
              <span>✅ Tâche automatiquement marquée comme vue</span>
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informations</h3>
            
            {task.deadline && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Échéance</div>
                  <div className="text-white">{formatDate(task.deadline)}</div>
                </div>
              </div>
            )}

            {task.created_by_name && (
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Créé par</div>
                  <div className="text-white">{task.created_by_name}</div>
                </div>
              </div>
            )}

            {task.assigned_to_name && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Assigné à</div>
                  <div className="text-white">{task.assigned_to_name}</div>
                </div>
              </div>
            )}

            {task.case_id && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Dossier associé</div>
                  <div className="text-white">{task.case_id}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dates importantes</h3>
            
            <div>
              <div className="text-sm text-slate-400">Créée le</div>
              <div className="text-white">{formatDate(task.created_at)}</div>
            </div>

            {task.assigned_at && (
              <div>
                <div className="text-sm text-slate-400">Assignée le</div>
                <div className="text-white">{formatDate(task.assigned_at)}</div>
              </div>
            )}

            {task.seen_at && (
              <div>
                <div className="text-sm text-slate-400">Vue le</div>
                <div className="text-white">{formatDate(task.seen_at)}</div>
              </div>
            )}

            {task.completed_at && (
              <div>
                <div className="text-sm text-slate-400">Terminée le</div>
                <div className="text-white">{formatDate(task.completed_at)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Pièces jointes */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Pièces jointes ({task.attachments.length})
            </h3>
            <div className="space-y-2">
              {task.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300 truncate flex-1">
                    {attachment.split('/').pop()}
                  </span>
                  <div className="flex gap-2 ml-3">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(attachment)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handlePrint(attachment)}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commentaire de clôture */}
        {task.completion_comment && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-2">Commentaire de clôture</h3>
            <p className="text-slate-300 italic">"{task.completion_comment}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {canEdit && (
            <Button onClick={() => onEdit(task)} className="bg-blue-600 hover:bg-blue-700">
              Modifier
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskDetailModal;
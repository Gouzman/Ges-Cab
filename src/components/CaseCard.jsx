import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Edit, 
  Trash2,
  Scale,
  Clock,
  CheckCircle,
  Paperclip,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CaseCard = ({ case: caseData, index, onEdit, onDelete }) => {
  // Protection contre les données undefined ou null
  if (!caseData) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'Open':
        return 'bg-bordeaux-500/20 text-bordeaux-400';
      case 'pending':
        return 'bg-bordeaux-300/20 text-bordeaux-300';
      case 'closed':
        return 'bg-bordeaux-700/20 text-bordeaux-700';
      default:
        return 'bg-bordeaux-200/20 text-bordeaux-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Scale className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'Haute':
        return 'border-bordeaux-500 bg-bordeaux-500/10';
      case 'medium':
      case 'Medium':
      case 'Moyenne':
        return 'border-bordeaux-400 bg-bordeaux-400/10';
      case 'low':
      case 'Basse':
        return 'border-bordeaux-300 bg-bordeaux-300/10';
      default:
        return 'border-bordeaux-600 bg-bordeaux-900/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getCaseTypeLabel = (type) => {
    const types = {
      'civil': 'Droit Civil',
      'commercial': 'Droit Commercial',
      'penal': 'Droit Pénal',
      'family': 'Droit de la Famille',
      'labor': 'Droit du Travail',
      'real-estate': 'Droit Immobilier',
      'intellectual': 'Propriété Intellectuelle',
      'administrative': 'Droit Administratif'
    };
    return types[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${getPriorityColor(caseData.priority || 'Moyenne')} backdrop-blur-sm border rounded-xl p-6 hover:scale-105 transition-all duration-200 flex flex-col`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(caseData.status || 'En cours')}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status || 'En cours')}`}>
            {(caseData.status || 'En cours') === 'active' ? 'Actif' : 
             (caseData.status || 'En cours') === 'pending' ? 'En attente' : 
             (caseData.status || 'En cours') === 'Ouvert' ? 'Ouvert' :
             (caseData.status || 'En cours') === 'En cours' ? 'En cours' : 'Fermé'}
          </span>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(caseData)}
            className="w-8 h-8 text-slate-400 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(caseData.id)}
            className="w-8 h-8 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">{caseData.id || 'ID non défini'}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {caseData.title || 'Titre non défini'}
        </h3>
        {caseData.description && (
          <p className="text-slate-400 text-sm line-clamp-3">
            {caseData.description}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-slate-300">
          <span className="font-medium">{getCaseTypeLabel(caseData.type)}</span>
        </div>
        
        {caseData.clientId && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Client: {caseData.clientId}</span>
          </div>
        )}
        
        {caseData.startDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Début: {formatDate(caseData.startDate)}</span>
          </div>
        )}
        
        {caseData.budget && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">{parseInt(caseData.budget).toLocaleString('fr-FR')} €</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            caseData.priority === 'urgent' ? 'bg-red-400' :
            caseData.priority === 'high' ? 'bg-orange-400' :
            caseData.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
          }`}></div>
          <span className="text-xs text-slate-400 capitalize">
            {caseData.priority === 'urgent' ? 'Urgente' :
             caseData.priority === 'high' ? 'Élevée' :
             caseData.priority === 'medium' ? 'Moyenne' : 'Faible'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {caseData.timeSpent > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Timer className="w-3 h-3" />
              <span>{caseData.timeSpent}h</span>
            </div>
          )}
          {caseData.attachments && caseData.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip className="w-3 h-3" />
              <span>{caseData.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CaseCard;
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Edit, Trash2, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TeamMemberCard = ({ member, index, onEdit, onDelete, isCurrentUser }) => {
  if (!member) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-200 print:bg-white print:border-slate-200 print:shadow-md print:hover:scale-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white print:text-black">{member.name || 'N/A'}</h3>
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 print:bg-blue-100 print:text-blue-700 print:border print:border-blue-300">
            <ShieldCheck className="w-4 h-4" />
            <span>{member.role || 'Non spécifié'}</span>
          </div>
        </div>
        
        <div className="flex gap-1 print:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(member)}
            className="w-8 h-8 text-slate-400 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {!isCurrentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(member.id)}
              className="w-8 h-8 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Award className="w-4 h-4 text-slate-400 print:text-slate-500" />
          <span className="text-slate-300 print:text-slate-700">{member.title || 'Non spécifié'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Briefcase className="w-4 h-4 text-slate-400 print:text-slate-500" />
          <span className="text-slate-300 print:text-slate-700">{member.function || 'Non spécifiée'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-slate-400 print:text-slate-500" />
          <span className="text-slate-300 print:text-slate-700">{member.email || 'N/A'}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 print:border-slate-200">
        <p className="text-xs text-slate-500 print:text-slate-500">
          Membre depuis le {new Date(member.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClientCard = ({ client, index, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-200 print:bg-white print:border-slate-200 print:shadow-md print:hover:scale-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg print:hidden ${
            client.type === 'company' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {client.type === 'company' ? (
              <Building className="w-6 h-6" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white print:text-black">
              {client.firstName} {client.lastName}
            </h3>
            {client.company && (
              <p className="text-slate-400 text-sm print:text-slate-600">{client.company}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-1 print:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(client)}
            className="w-8 h-8 text-slate-400 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(client.id)}
            className="w-8 h-8 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-slate-400 print:text-slate-500" />
          <span className="text-slate-300 print:text-slate-700">{client.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-slate-400 print:text-slate-500" />
          <span className="text-slate-300 print:text-slate-700">{client.phone}</span>
        </div>
        
        {(client.address || client.city) && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 print:text-slate-500" />
            <div className="text-slate-300 print:text-slate-700">
              {client.address && <div>{client.address}</div>}
              {client.city && (
                <div>
                  {client.postalCode} {client.city}
                  {client.country && client.country !== 'France' && `, ${client.country}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {client.notes && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 print:border-slate-200">
          <p className="text-slate-400 text-sm line-clamp-3 print:text-slate-600">
            {client.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50 print:border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500 print:text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Ajouté le {formatDate(client.createdAt)}</span>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium print:border print:text-slate-600 ${
          client.type === 'company' 
            ? 'bg-blue-500/20 text-blue-400 print:bg-blue-100 print:border-blue-300' 
            : 'bg-purple-500/20 text-purple-400 print:bg-purple-100 print:border-purple-300'
        }`}>
          {client.type === 'company' ? 'Entreprise' : 'Particulier'}
        </div>
      </div>
    </motion.div>
  );
};

export default ClientCard;
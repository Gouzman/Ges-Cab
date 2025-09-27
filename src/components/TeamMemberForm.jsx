import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, ShieldCheck, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TeamMemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    function: '',
    email: '',
    role: 'Assistant(e)',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        title: member.title || '',
        function: member.function || '',
        email: member.email || '',
        role: member.role || 'Assistant(e)',
      });
    }
  }, [member]);

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
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {member ? 'Modifier le Collaborateur' : 'Nouveau Collaborateur'}
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
              <User className="w-4 h-4 inline mr-2" />
              NOMS ET PRENOMS *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Marie Curie"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                TITRES
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Dr., Me."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                FONCTIONS
              </label>
              <input
                type="text"
                name="function"
                value={formData.function}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Avocat Stagiaire"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              COURRIELS *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="marie.curie@cabinet.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <ShieldCheck className="w-4 h-4 inline mr-2" />
              Rôle / Niveau d'accréditation *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Inscrire un poste au choix (ex: Admin, Avocat...)"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              {member ? 'Mettre à jour' : 'Ajouter le collaborateur'}
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

export default TeamMemberForm;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, Calendar, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
// TODO: Replace with backend API calls

const EventForm = ({ currentUser, onCancel, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    description: '',
    attendees: [],
  });
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const { data, error } = await supabase.from('profiles').select('id, name');
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les collaborateurs.' });
      } else {
        setCollaborators(data.filter(c => c.id !== currentUser.id));
      }
    };
    fetchCollaborators();
  }, [currentUser.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendeeToggle = (collaboratorId) => {
    setFormData(prev => {
      const attendees = prev.attendees.includes(collaboratorId)
        ? prev.attendees.filter(id => id !== collaboratorId)
        : [...prev.attendees, collaboratorId];
      return { ...prev, attendees };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le titre et la date de début sont obligatoires.' });
      return;
    }

    const { error } = await supabase.from('events').insert([
      {
        title: formData.title,
        start_date: formData.startTime,
        description: formData.description,
        created_by: currentUser.id,
        attendees: formData.attendees,
      },
    ]);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'événement n'a pas pu être créé." });
    } else {
      toast({ title: '✅ Événement créé', description: 'Votre événement a été ajouté à l\'agenda.' });
      onEventCreated();
    }
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
          <h2 className="text-2xl font-bold text-white">Nouvel Événement</h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Titre de l'événement *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Réunion projet X"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date et heure de début *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ordre du jour, détails..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Visible par
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
              {collaborators.map(collab => (
                <div key={collab.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`attendee-${collab.id}`}
                    checked={formData.attendees.includes(collab.id)}
                    onChange={() => handleAttendeeToggle(collab.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`attendee-${collab.id}`} className="ml-3 block text-sm text-slate-300">
                    {collab.name}
                  </label>
                </div>
              ))}
            </div>
             <p className="text-xs text-slate-500 mt-2">L'événement sera toujours visible par vous et les administrateurs.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              Créer l'événement
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
              Annuler
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

EventForm.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onEventCreated: PropTypes.func.isRequired
};

export default EventForm;
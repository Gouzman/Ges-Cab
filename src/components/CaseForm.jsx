import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Tag, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CaseForm = ({ case: caseData, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    type: 'civil',
    status: 'ouvert',
    priority: 'moyenne'
  });



  // Types de dossiers disponibles
  const caseTypes = [
    { value: 'civil', label: 'Civil', icon: '⚖️' },
    { value: 'penal', label: 'Pénal', icon: '🏛️' },
    { value: 'commercial', label: 'Commercial', icon: '💼' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'administratif', label: 'Administratif', icon: '🏢' },
    { value: 'autre', label: 'Autre', icon: '📋' }
  ];

  // Les colonnes type et description sont maintenant disponibles

  // Initialiser les données si on édite un dossier
  useEffect(() => {
    if (caseData) {
      setFormData({
        id: caseData.id || '',
        title: caseData.title || '',
        description: caseData.description || '',
        type: caseData.type || 'civil',
        status: caseData.status || 'ouvert',
        priority: caseData.priority || 'moyenne'
      });
    }
  }, [caseData]);



  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du dossier est obligatoire."
      });
      return;
    }

    // Préparer les données avec tous les champs disponibles
    const submitData = {
      title: formData.title,
      description: formData.description || '',
      type: formData.type || 'civil',
      status: formData.status,
      priority: formData.priority
    };

    if (caseData) {
      submitData.id = formData.id;
    }

    onSubmit(submitData);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {caseData ? 'Modifier le dossier' : 'Nouveau dossier'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Info: Formulaire complet */}
        <div className="mb-6 p-3 rounded-lg border border-green-500/20 bg-green-500/10">
          <p className="text-green-300 text-sm flex items-center">
            ✓ Formulaire complet a été activé avec tous les champs disponibles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre du dossier */}
          <div>
            <label htmlFor="case-title" className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Titre du dossier *
            </label>
            <input
              id="case-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Affaire Martin vs. Société ABC"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="case-description" className="block text-sm font-medium text-slate-300 mb-2">
              <AlignLeft className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              id="case-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Description détaillée de l'affaire..."
            />
          </div>

          {/* Type et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de droit */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Type de droit
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {caseTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="case-status" className="block text-sm font-medium text-slate-300 mb-2">
                Statut
              </label>
              <select
                id="case-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ouvert">🟢 Ouvert</option>
                <option value="en_cours">🟡 En cours</option>
                <option value="ferme">🔴 Fermé</option>
                <option value="archive">📦 Archivé</option>
              </select>
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label htmlFor="case-priority" className="block text-sm font-medium text-slate-300 mb-2">
              Priorité
            </label>
            <select
              id="case-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="basse">🟢 Basse</option>
              <option value="moyenne">🟡 Moyenne</option>
              <option value="haute">🟠 Haute</option>
              <option value="urgente">🔴 Urgente</option>
            </select>
          </div>



          {/* Boutons d'action */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {caseData ? 'Mettre à jour' : 'Créer le dossier'}
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

export default CaseForm;
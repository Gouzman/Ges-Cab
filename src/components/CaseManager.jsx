import React, { useState, useEffect } from 'react';
    import PropTypes from 'prop-types';
    import { motion } from 'framer-motion';
    import { Plus, Search, FileText, Scale, Clock, CheckCircle, Archive, Printer, X, Pencil, Trash2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import CaseForm from '@/components/CaseForm';
    import CaseCard from '@/components/CaseCard';
    import { Checkbox } from '@/components/ui/checkbox';
    import { supabase } from '@/lib/customSupabaseClient';

    const CaseManager = ({ currentUser }) => {
      const [cases, setCases] = useState([]);
      const [showForm, setShowForm] = useState(false);
      const [editingCase, setEditingCase] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterStatus, setFilterStatus] = useState('all');
      const [showPrintDialog, setShowPrintDialog] = useState(false);
      const [selectedCases, setSelectedCases] = useState([]);



      useEffect(() => {
        fetchCases();
      }, []);

      const fetchCases = async () => {
        const { data, error } = await supabase
          .from('cases')
          .select('id, title, description, type, status, priority, created_at')
          .order('created_at', { ascending: false });
        if (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les dossiers." });
        } else {
          // Pour l'instant, tous les utilisateurs voient tous les dossiers
          // Sera amélioré après les migrations DB
          setCases(data || []);
        }
      };

      const handleAddCase = async (caseData) => {
        // Utiliser toutes les données du formulaire maintenant que toutes les colonnes existent
        const caseToInsert = {
          title: caseData.title,
          description: caseData.description || '',
          type: caseData.type || 'civil',
          status: caseData.status || 'ouvert',
          priority: caseData.priority || 'moyenne'
        };
        const { data, error } = await supabase.from('cases').insert([caseToInsert]).select('id, title, description, type, status, priority, created_at');
        if (error) {
          toast({ variant: "destructive", title: "Erreur de création", description: error.message });
        } else {
          setCases([data[0], ...cases]);
          setShowForm(false);
          toast({ title: "✅ Dossier créé", description: `Le dossier ${data[0].id} a été créé avec succès.` });
        }
      };

      const handleEditCase = async (caseData) => {
        const { id, ...updateData } = caseData;
        const { data, error } = await supabase.from('cases').update(updateData).eq('id', editingCase.id).select('id, title, description, type, status, priority, created_at');
        if (error) {
          toast({ variant: "destructive", title: "Erreur de modification", description: error.message });
        } else {
          setCases(cases.map(c => c.id === editingCase.id ? data[0] : c));
          setEditingCase(null);
          setShowForm(false);
          toast({ title: "✅ Dossier modifié", description: "Le dossier a été mis à jour avec succès." });
        }
      };

      const handleDeleteCase = async (caseId) => {
        const { error } = await supabase.from('cases').delete().eq('id', caseId);
        if (error) {
          toast({ variant: "destructive", title: "Erreur de suppression", description: error.message });
        } else {
          setCases(cases.filter(c => c.id !== caseId));
          toast({ title: "🗑️ Dossier supprimé", description: "Le dossier a été supprimé avec succès." });
        }
      };

      const filteredCases = cases.filter(caseItem => {
        const matchesSearch = caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             caseItem.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             caseItem.id?.toString().includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      });

      const statusCounts = {
        all: cases.length,
        'ouvert': cases.filter(c => c.status === 'ouvert').length,
        'en_cours': cases.filter(c => c.status === 'en_cours').length,
        'ferme': cases.filter(c => c.status === 'ferme').length,
        'archive': cases.filter(c => c.status === 'archive').length
      };
      
      // Fonctions d'aide pour les styles et textes des statuts et priorités
      const getStatusClass = (status) => {
        switch (status) {
          case 'ferme': return 'bg-green-100 text-green-800';
          case 'en_cours': return 'bg-blue-100 text-blue-800';
          case 'ouvert': return 'bg-yellow-100 text-yellow-800';
          case 'archive': return 'bg-gray-100 text-gray-800';
          default: return 'bg-slate-100 text-slate-800';
        }
      };
      
      const getStatusText = (status) => {
        switch (status) {
          case 'ferme': return 'Fermé';
          case 'en_cours': return 'En cours';
          case 'ouvert': return 'Ouvert';
          case 'archive': return 'Archivé';
          default: return status || 'Non défini';
        }
      };
      
      const getPriorityClass = (priority) => {
        switch (priority) {
          case 'haute': return 'bg-red-100 text-red-800 border border-red-300';
          case 'moyenne': return 'bg-orange-100 text-orange-800';
          case 'basse': return 'bg-blue-100 text-blue-800';
          default: return 'bg-slate-100 text-slate-800';
        }
      };
      
      const getPriorityText = (priority) => {
        switch (priority) {
          case 'haute': return 'Haute';
          case 'moyenne': return 'Moyenne';
          case 'basse': return 'Basse';
          default: return priority || 'Non définie';
        }
      };

      // ✅ Ajout des fonctions pour l'impression des dossiers
      const handleSelectCase = (caseId) => {
        setSelectedCases(prev => {
          if (prev.includes(caseId)) {
            return prev.filter(id => id !== caseId);
          } else {
            return [...prev, caseId];
          }
        });
      };

      const handleSelectAllCases = (select) => {
        if (select) {
          setSelectedCases(filteredCases.map(c => c.id));
        } else {
          setSelectedCases([]);
        }
      };

      const handlePrintSelected = () => {
        if (selectedCases.length === 0) {
          toast({
            variant: "destructive",
            title: "Aucun dossier sélectionné",
            description: "Veuillez sélectionner au moins un dossier à imprimer."
          });
          return;
        }

        // Créer une fenêtre d'impression pour les dossiers sélectionnés
        const printWindow = window.open('', '_blank');
        
        // Vérifier si la fenêtre a bien été ouverte
        if (!printWindow) {
          toast({ variant: "destructive", title: "Bloqueur de popup", description: "Veuillez autoriser les fenêtres pop-up pour imprimer." });
          return;
        }
        
        const casesToPrint = cases.filter(c => selectedCases.includes(c.id));

        const htmlContent = `
          <html>
            <head>
              <title>Liste des Dossiers - Ges-Cab</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f2f2f2; padding: 10px; text-align: left; border: 1px solid #ddd; }
                td { padding: 10px; border: 1px solid #ddd; }
                .header { display: flex; justify-content: space-between; align-items: center; }
                .date { margin-top: 10px; text-align: right; font-style: italic; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Liste des Dossiers</h1>
                <div class="date">Date: ${new Date().toLocaleDateString()}</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Statut</th>
                    <th>Priorité</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  ${casesToPrint.map(c => `
                    <tr>
                      <td>${c.title || '-'}</td>
                      <td>${c.status || '-'}</td>
                      <td>${c.priority || '-'}</td>
                      <td>${c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setShowPrintDialog(false);
        }, 250);
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestion des Dossiers</h1>
              <p className="text-slate-400">Suivez et gérez vos affaires juridiques</p>
            </div>
            <div className="flex gap-2">
              {/* ✅ Ajout de l'option "Imprimer" */}
              <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
                <Printer className="w-4 h-4 mr-2" /> Imprimer
              </Button>
              <Button
                onClick={() => {
                  setEditingCase(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Dossier
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: 'all', label: 'Total', icon: FileText },
              { key: 'en-cours', label: 'En cours', icon: Scale },
              { key: 'juge-acheve', label: 'Jugé/Achevé', icon: CheckCircle },
              { key: 'cloture', label: 'Clôturé', icon: Clock },
              { key: 'archive', label: 'Archivé', icon: Archive }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{statusCounts[stat.key] || 0}</p>
                    </div>
                    <Icon className="w-6 h-6 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un dossier par ID, titre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en-cours">En cours</option>
                  <option value="juge-acheve">Jugé/achevé</option>
                  <option value="cloture">Clôturé</option>
                  <option value="archive">Archivé - En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ Modification demandée : présentation des dossiers sous forme de liste */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Checkbox 
                        id="select-all"
                        className="mr-2"
                        checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                        onCheckedChange={handleSelectAllCases}
                      />
                      Titre
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Priorité</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Date de création</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem, index) => (
                  <tr key={caseItem.id} className={index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/60'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Checkbox 
                          id={`select-case-${caseItem.id}`}
                          className="mr-3"
                          checked={selectedCases.includes(caseItem.id)}
                          onCheckedChange={(checked) => handleSelectCase(caseItem.id)}
                        />
                        <div>
                          <div className="font-medium text-white">{caseItem.title}</div>
                          {caseItem.description && (
                            <div className="text-sm text-slate-400 truncate max-w-[300px]">{caseItem.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseItem.status)}`}>
                        {getStatusText(caseItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(caseItem.priority)}`}>
                        {getPriorityText(caseItem.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {caseItem.created_at ? new Date(caseItem.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={() => {
                            setEditingCase(caseItem);
                            setShowForm(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-slate-700/50"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCase(caseItem.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-700/50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCases.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucun dossier trouvé</h3>
              <p className="text-slate-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer votre premier dossier'
                }
              </p>
            </motion.div>
          )}

          {showForm && (
            <CaseForm
              case={editingCase}
              onSubmit={editingCase ? handleEditCase : handleAddCase}
              onCancel={() => {
                setShowForm(false);
                setEditingCase(null);
              }}
              currentUser={currentUser}
            />
          )}
          
          {/* Dialogue de confirmation d'impression */}
          {showPrintDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-[500px] max-w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Imprimer les dossiers</h3>
                  <Button variant="ghost" onClick={() => setShowPrintDialog(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mb-6">
                  <p className="text-slate-300 mb-4">
                    {selectedCases.length === 0 ? (
                      "Aucun dossier sélectionné. Veuillez cocher les dossiers à imprimer."
                    ) : (
                      `Vous avez sélectionné ${selectedCases.length} dossier(s) à imprimer.`
                    )}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                      Annuler
                    </Button>
                    <Button 
                      disabled={selectedCases.length === 0} 
                      onClick={handlePrintSelected}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer la sélection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    CaseManager.propTypes = {
      currentUser: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        role: PropTypes.string
      }).isRequired
    };

    export default CaseManager;
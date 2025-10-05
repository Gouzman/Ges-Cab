import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Tag, Save, Plus, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const modules = [
  { id: 'dashboard', label: 'Tableau de Bord', actions: [] },
  { id: 'tasks', label: 'Tâches', actions: ['create', 'edit', 'delete', 'reassign'] },
  { id: 'clients', label: 'Clients', actions: ['create', 'edit', 'delete'] },
  { id: 'cases', label: 'Dossiers', actions: ['create', 'edit', 'delete'] },
  { id: 'calendar', label: 'Agenda', actions: ['create', 'edit', 'delete'] },
  { id: 'documents', label: 'Documents', actions: ['upload', 'delete'] },
  { id: 'billing', label: 'Facturation', actions: ['create', 'edit', 'delete'] },
  { id: 'team', label: 'Collaborateurs', actions: ['create', 'edit', 'delete'] },
  { id: 'reports', label: 'Rapports', actions: [] },
  { id: 'settings', label: 'Paramètres', actions: [] },
];

const defaultPermissions = modules.reduce((acc, mod) => {
  acc[mod.id] = {
    visible: true,
    actions: mod.actions.reduce((actAcc, action) => {
      actAcc[action] = true;
      return actAcc;
    }, {})
  };
  return acc;
}, {});

const Settings = () => {
  const { user, getAllUsers, getUserPermissions, updateUserPermissions, refreshCurrentUser } = useAuth();
  const [taskCategories, setTaskCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const isAdmin = user && (user.function === 'Gerant' || user.function === 'Associe Emerite' || (user.role && user.role.toLowerCase() === 'admin'));

  const translateAction = (action) => {
    const translations = {
      'create': 'Créer',
      'edit': 'Modifier',
      'delete': 'Supprimer',
      'reassign': 'Réassigner',
      'upload': 'Télécharger'
    };
    return translations[action] || action;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      // Utiliser les catégories par défaut depuis le localStorage ou une valeur par défaut
      const savedCategories = localStorage.getItem('taskCategories');
      if (savedCategories) {
        setTaskCategories(JSON.parse(savedCategories));
      }
    };

    const fetchCollaborators = async () => {
      try {
        const { data, error } = await getAllUsers();
        if (!error && data) {
          // Exclure l'utilisateur actuel de la liste
          const filteredUsers = data.filter(u => u.id !== user?.id);
          setCollaborators(filteredUsers);
          setTeamMembers(filteredUsers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des collaborateurs:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les collaborateurs."
        });
      }
    };

    if (isAdmin) {
      fetchCategories();
      fetchCollaborators();
    }
  }, [isAdmin, user?.id, getAllUsers]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (selectedUser) {
        setIsLoadingPermissions(true);
        try {
          const { permissions: userPerms, error } = await getUserPermissions(selectedUser.id);
          
          if (error) {
            console.error('Erreur lors du chargement des permissions:', error);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger les permissions de l'utilisateur."
            });
          }

          // Créer les permissions par défaut si aucune n'existe
          const defaultPermissions = modules.reduce((acc, module) => {
            acc[module.id] = {
              visible: userPerms?.[module.id]?.visible ?? true,
              actions: module.actions.reduce((moduleAcc, action) => {
                moduleAcc[action] = userPerms?.[module.id]?.actions?.[action] ?? false;
                return moduleAcc;
              }, {})
            };
            return acc;
          }, {});
          
          setPermissions(defaultPermissions);
        } catch (error) {
          console.error('Erreur réseau lors du chargement des permissions:', error);
          toast({
            variant: "destructive",
            title: "Erreur réseau",
            description: "Impossible de charger les permissions."
          });
        } finally {
          setIsLoadingPermissions(false);
        }
      } else {
        setPermissions(null);
      }
    };
    fetchPermissions();
  }, [selectedUser, getUserPermissions]);

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    const newCat = { value: newCategory.toLowerCase().replace(/\s+/g, '-'), label: newCategory };
    if (taskCategories.some(cat => cat.value === newCat.value)) {
      toast({ variant: "destructive", title: "Catégorie existante" });
      return;
    }
    setTaskCategories([...taskCategories, newCat]);
    setNewCategory('');
  };

  const handleDeleteCategory = (value) => {
    setTaskCategories(taskCategories.filter(cat => cat.value !== value));
  };

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('taskCategories', JSON.stringify(taskCategories));
      toast({ title: "✅ Paramètres sauvegardés", description: "Vos modifications ont été enregistrées." });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder les paramètres." });
    }
  };

  const handlePermissionChange = (moduleId, type, action) => {
    setPermissions(prev => {
      const newPerms = JSON.parse(JSON.stringify(prev));
      if (!newPerms[moduleId]) {
        newPerms[moduleId] = { visible: false, actions: {} };
      }
      if (type === 'visible') {
        newPerms[moduleId].visible = !newPerms[moduleId].visible;
      } else if (type === 'action') {
        if (!newPerms[moduleId].actions) {
          newPerms[moduleId].actions = {};
        }
        newPerms[moduleId].actions[action] = !newPerms[moduleId].actions[action];
      }
      return newPerms;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || !permissions) return;
    
    setIsSavingPermissions(true);
    
    try {
      const { success } = await updateUserPermissions(selectedUser.id, permissions);
      
      if (success) {
        // Rafraîchir les données de l'utilisateur actuel si il a modifié ses propres permissions
        if (selectedUser.id === user?.id) {
          await refreshCurrentUser();
        }
        
        toast({ 
          title: "✅ Permissions sauvegardées", 
          description: `Les permissions pour ${selectedUser.name} ont été mises à jour.` 
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des permissions:", error);
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Impossible de sauvegarder les permissions." 
      });
    } finally {
      setIsSavingPermissions(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <SettingsIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Accès non autorisé</h1>
        <p className="text-slate-400">Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-slate-400">Gérez les configurations de l'application.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6"><Shield className="w-6 h-6 text-purple-400" /><h2 className="text-xl font-semibold text-white">Gestion des Permissions</h2></div>
        <div className="mb-6">
          <Label htmlFor="collaborator-select" className="text-slate-300 mb-3 block font-medium">
            Sélectionner un collaborateur
          </Label>
          <select 
            id="collaborator-select" 
            onChange={(e) => {
              const user = collaborators.find(c => c.id === e.target.value);
              setSelectedUser(user || null);
            }}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            defaultValue=""
          >
            <option value="">-- Choisissez un utilisateur --</option>
            {collaborators.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.email} ({c.role || 'Utilisateur'})
              </option>
            ))}
          </select>
          {collaborators.length === 0 && (
            <p className="text-slate-500 text-sm mt-2">
              Aucun collaborateur trouvé. Créez d'abord des utilisateurs dans la section Équipe.
            </p>
          )}
        </div>
        {isLoadingPermissions && selectedUser && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span>Chargement des permissions...</span>
            </div>
          </div>
        )}
        
        {permissions && selectedUser && !isLoadingPermissions && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                <span className="font-medium">Utilisateur sélectionné :</span><br />
                <span className="text-white">{selectedUser.name}</span> - {selectedUser.email}<br />
                <span className="text-slate-300">Rôle : {selectedUser.role || 'Non défini'}</span>
              </p>
            </div>
            
            {modules.map(mod => (
              <div key={mod.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-white">{mod.label}</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`visible-${mod.id}`} className="text-slate-300">Visible</Label>
                    <Checkbox 
                      id={`visible-${mod.id}`} 
                      checked={permissions[mod.id]?.visible || false} 
                      onCheckedChange={() => handlePermissionChange(mod.id, 'visible')} 
                    />
                  </div>
                </div>
                {mod.actions.length > 0 && permissions[mod.id]?.visible && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-600/50">
                    {mod.actions.map(action => (
                      <div key={action} className="flex items-center gap-2">
                        <Checkbox 
                          id={`${mod.id}-${action}`} 
                          checked={permissions[mod.id]?.actions?.[action] || false} 
                          onCheckedChange={() => handlePermissionChange(mod.id, 'action', action)} 
                        />
                        <Label htmlFor={`${mod.id}-${action}`} className="capitalize text-slate-300">
                          {translateAction(action)}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-600/50">
              <p className="text-slate-400 text-sm">
                Les modifications prennent effet immédiatement après la sauvegarde.
              </p>
              <Button 
                onClick={handleSavePermissions} 
                disabled={isSavingPermissions}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isSavingPermissions ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> 
                    Sauvegarder les Permissions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {!selectedUser && !isLoadingPermissions && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Sélectionnez un collaborateur pour gérer ses permissions.</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6"><Tag className="w-6 h-6 text-blue-400" /><h2 className="text-xl font-semibold text-white">Catégories de Tâches</h2></div>
        <div className="space-y-3 mb-4">
          {taskCategories.map(cat => (
            <div key={cat.value} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
              <span className="text-slate-300">{cat.label}</span>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.value)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nouvelle catégorie..." className="flex-grow px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={handleAddCategory} className="bg-blue-500 hover:bg-blue-600"><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"><Save className="w-5 h-5 mr-2" /> Sauvegarder les Paramètres Généraux</Button>
      </div>
    </div>
  );
};

export default Settings;
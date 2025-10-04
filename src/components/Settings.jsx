import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Tag, Save, Plus, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from "@/lib/api";
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [taskCategories, setTaskCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const isAdmin = user && (user.function === 'Gerant' || user.function === 'Associe Emerite' || (user.role && user.role.toLowerCase() === 'admin'));

  useEffect(() => {
    const fetchCategories = async () => {
      const { rows: metadataRows } = await db.query('SELECT task_categories FROM app_metadata WHERE id = 1');
      if (metadataRows.length > 0) {
        setTaskCategories(metadataRows[0].task_categories || []);
      }
      if (data?.task_categories) {
        setTaskCategories(data.task_categories);
      }
    };

    const fetchCollaborators = async () => {
      const { rows: teamRows } = await db.query('SELECT * FROM users WHERE id != $1', [user.id]);
      setTeamMembers(teamRows);
      setCollaborators(data || []);
    };

    if (isAdmin) {
      fetchCategories();
      fetchCollaborators();
    }
  }, [isAdmin, user.id]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (selectedUser) {
        const { rows: permissionRows } = await db.query('SELECT permissions FROM user_permissions WHERE user_id = $1', [selectedUser.id]);
      if (permissionRows.length > 0) {
        setPermissions(permissionRows[0].permissions);
      }
        
        if (error) {
          console.error("Error fetching permissions:", error);
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les permissions." });
          setPermissions(null);
        } else {
          setPermissions(data?.permissions || defaultPermissions);
        }
      } else {
        setPermissions(null);
      }
    };
    fetchPermissions();
  }, [selectedUser]);

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
    await db.query('INSERT INTO app_metadata (id, task_categories) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET task_categories = $1', [JSON.stringify(taskCategories)]);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder les paramètres." });
    } else {
      toast({ title: "✅ Paramètres sauvegardés", description: "Vos modifications ont été enregistrées." });
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
    await db.query('INSERT INTO user_permissions (user_id, permissions) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET permissions = $2', [selectedUser.id, permissions]);
    if (error) {
      console.error("Error saving permissions:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder les permissions. Vérifiez les logs de la console." });
    } else {
      toast({ title: "✅ Permissions sauvegardées", description: `Les permissions pour ${selectedUser.name} ont été mises à jour.` });
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
        <div className="mb-4">
          <Label htmlFor="collaborator-select" className="text-slate-300 mb-2 block">Sélectionner un collaborateur</Label>
          <select id="collaborator-select" onChange={(e) => setSelectedUser(collaborators.find(c => c.id === e.target.value))} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">-- Choisissez un utilisateur --</option>
            {collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {permissions && selectedUser && (
          <div className="space-y-4">
            {modules.map(mod => (
              <div key={mod.id} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-white">{mod.label}</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`visible-${mod.id}`}>Visible</Label>
                    <Checkbox id={`visible-${mod.id}`} checked={permissions[mod.id]?.visible} onCheckedChange={() => handlePermissionChange(mod.id, 'visible')} />
                  </div>
                </div>
                {mod.actions.length > 0 && permissions[mod.id]?.visible && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-600/50">
                    {mod.actions.map(action => (
                      <div key={action} className="flex items-center gap-2">
                        <Checkbox id={`${mod.id}-${action}`} checked={permissions[mod.id]?.actions?.[action]} onCheckedChange={() => handlePermissionChange(mod.id, 'action', action)} />
                        <Label htmlFor={`${mod.id}-${action}`} className="capitalize">{action}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button onClick={handleSavePermissions} className="bg-purple-600 hover:bg-purple-700"><Save className="w-4 h-4 mr-2" /> Sauvegarder les Permissions</Button>
            </div>
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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Mail, User, Shield, Clock, Key, RefreshCw, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const { user, toast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    function: '',
    role: 'user'
  });
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user && (
    user.function === 'Gerant' || 
    user.function === 'Associe Emerite' || 
    (user.role && user.role.toLowerCase() === 'admin')
  );

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.fullName || !newUser.function) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Tous les champs sont obligatoires."
      });
      return;
    }

    try {
      setCreatingUser(true);
      
      // Appeler la fonction de création d'utilisateur
      const { data, error } = await supabase.rpc('admin_create_user', {
        p_email: newUser.email.toLowerCase(),
        p_full_name: newUser.fullName,
        p_function: newUser.function,
        p_role: newUser.role,
        p_admin_id: user.id
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        setTempPasswordResult({
          email: result.email,
          tempPassword: result.temp_password
        });
        
        // Réinitialiser le formulaire
        setNewUser({
          email: '',
          fullName: '',
          function: '',
          role: 'user'
        });
        
        // Recharger la liste
        await fetchUsers();
        
        toast({
          title: "✅ Utilisateur créé",
          description: `L'utilisateur ${newUser.fullName} a été créé avec succès.`
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur."
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResetPassword = async (userEmail, userName) => {
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        p_email: userEmail
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        setTempPasswordResult({
          email: result.email,
          tempPassword: result.temp_password
        });
        
        await fetchUsers();
        
        toast({
          title: "🔑 Mot de passe réinitialisé",
          description: `Un nouveau mot de passe temporaire a été généré pour ${userName}.`
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe."
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copié",
      description: "Le mot de passe a été copié dans le presse-papiers."
    });
  };

  const sendPasswordByEmail = async (email, tempPassword) => {
    // Cette fonction devrait intégrer un service d'email
    // Pour l'instant, on simule l'envoi
    toast({
      title: "📧 Email simulé",
      description: `Email avec le mot de passe temporaire envoyé à ${email}`
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Accès restreint</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas les permissions pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Créez et gérez les comptes utilisateurs du cabinet.</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                L'utilisateur recevra un mot de passe temporaire par email.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="function">Fonction *</Label>
                <select
                  id="function"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newUser.function}
                  onChange={(e) => setNewUser({...newUser, function: e.target.value})}
                  required
                >
                  <option value="">Sélectionner une fonction</option>
                  <option value="Avocat">Avocat</option>
                  <option value="Collaborateur">Collaborateur</option>
                  <option value="Secretaire">Secrétaire</option>
                  <option value="Stagiaire">Stagiaire</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={creatingUser}>
                  {creatingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Créer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog pour afficher le mot de passe temporaire */}
      {tempPasswordResult && (
        <Dialog open={!!tempPasswordResult} onOpenChange={() => setTempPasswordResult(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>🔑 Mot de passe temporaire généré</DialogTitle>
              <DialogDescription>
                Communiquez ce mot de passe à l'utilisateur de manière sécurisée.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{tempPasswordResult.email}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Mot de passe:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded border font-mono text-lg">
                      {tempPasswordResult.tempPassword}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(tempPasswordResult.tempPassword)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => sendPasswordByEmail(tempPasswordResult.email, tempPasswordResult.tempPassword)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer par email
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setTempPasswordResult(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="ml-2">Chargement...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((userData) => (
            <motion.div
              key={userData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{userData.full_name}</div>
                    <div className="text-sm text-gray-600">{userData.email}</div>
                    <div className="text-sm text-gray-500">{userData.function}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {userData.first_login ? (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Première connexion
                    </Badge>
                  ) : (
                    <Badge variant="default">Actif</Badge>
                  )}
                  
                  {userData.temp_password_status !== 'Aucun' && (
                    <Badge variant={userData.temp_password_status === 'Actif' ? 'default' : 'destructive'}>
                      <Key className="w-3 h-3 mr-1" />
                      {userData.temp_password_status}
                    </Badge>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResetPassword(userData.email, userData.full_name)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer un nouvel utilisateur.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
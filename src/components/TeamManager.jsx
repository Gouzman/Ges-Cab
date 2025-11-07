import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Plus, Search, Briefcase, User, Upload, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TeamMemberForm from '@/components/TeamMemberForm';
import TeamMemberCard from '@/components/TeamMemberCard';
import Papa from 'papaparse';
import { useAuth } from '../contexts/SimpleAuthContext';

const TeamManager = ({ currentUser }) => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordDialog, setPasswordDialog] = useState({ isOpen: false, memberName: '', password: '' });
  const csvInputRef = useRef(null);
  const { signUp } = useAuth();

  // Fonction pour générer un mot de passe temporaire : 5 chiffres + première lettre nom + première lettre prénom
  const generateTempPassword = (name) => {
    // Générer 5 chiffres aléatoires
    const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5 chiffres entre 10000 et 99999
    
    // Extraire les premières lettres du nom et prénom
    const nameParts = name.trim().split(' ');
    const firstNameInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : 'X';
    const lastNameInitial = nameParts[1] ? nameParts[1][0].toUpperCase() : 'X';
    
    return `${randomNumbers}${firstNameInitial}${lastNameInitial}`;
  };

  const closePasswordDialog = () => {
    setPasswordDialog({ isOpen: false, memberName: '', password: '' });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les collaborateurs." });
    } else {
      // S'assurer que is_active est défini (true par défaut si la colonne n'existe pas encore)
      const membersWithStatus = (data || []).map(member => ({
        ...member,
        is_active: member.is_active ?? true
      }));
      setMembers(membersWithStatus);
    }
  };

  const handleAddMember = async (memberData) => {
    // Générer le mot de passe temporaire
    const tempPassword = generateTempPassword(memberData.name);
    
    const { error } = await signUp(memberData.email, tempPassword, {
      data: {
        name: memberData.name,
        role: memberData.role,
        title: memberData.title,
        function: memberData.function,
      }
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le collaborateur." });
    } else {
      fetchMembers();
      setShowForm(false);
      // Ouvrir le dialog avec le mot de passe généré
      setPasswordDialog({
        isOpen: true,
        memberName: memberData.name,
        password: tempPassword
      });
      toast({ title: "✅ Collaborateur créé", description: `${memberData.name} a été ajouté à l'équipe.` });
    }
  };

  const handleEditMember = async (memberData) => {
    if (!editingMember) return;
    const { data, error } = await supabase.from('profiles').update({
      name: memberData.name,
      title: memberData.title,
      function: memberData.function,
      role: memberData.role,
    }).eq('id', editingMember.id).select();

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de modifier le collaborateur." });
    } else {
      setMembers(members.map(m => m.id === editingMember.id ? data[0] : m));
      setEditingMember(null);
      setShowForm(false);
      toast({ title: "✅ Collaborateur modifié", description: "Les informations ont été mises à jour." });
    }
  };

  const handleDeleteMember = async (memberId) => {
    toast({ variant: "destructive", title: "Action non disponible", description: "La suppression d'utilisateurs doit être gérée depuis les paramètres d'administration de Supabase." });
  };

  const toggleMemberStatus = async (memberId, currentStatus) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', memberId);

    if (error) {
      if (error.message.includes('column "is_active" does not exist')) {
        toast({ 
          variant: "destructive", 
          title: "Colonne manquante", 
          description: "La colonne 'is_active' doit être créée dans Supabase. Consultez l'administrateur." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Erreur", 
          description: `Impossible de modifier le statut: ${error.message}` 
        });
      }
    } else {
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, is_active: newStatus } : m
      ));
      toast({ 
        title: newStatus ? "✅ Compte activé" : "⚠️ Compte désactivé", 
        description: newStatus 
          ? "Le collaborateur peut maintenant se connecter." 
          : "Le collaborateur ne peut plus se connecter."
      });
    }
  };

  const handlePrint = () => {
    globalThis.print();
  };

  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          for (const row of results.data) {
            if (row.name && row.email && row.role) {
              await signUp(row.email, 'password', {
                data: { name: row.name, role: row.role, title: row.title || '', function: row.function || '' }
              });
            }
          }
          fetchMembers();
          toast({ title: "✅ Importation terminée", description: "Les collaborateurs ont été invités." });
        },
        error: (error) => {
          toast({ variant: "destructive", title: "❌ Erreur de lecture du fichier", description: error.message });
        }
      });
    }
    event.target.value = '';
  };

  const filteredMembers = members.filter(member => {
    if (!member) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.function?.toLowerCase().includes(searchLower)
    );
  });

  const roleCounts = members.reduce((acc, member) => {
    if (member?.role) {
      const role = member.role.toLowerCase();
      acc[role] = (acc[role] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6" id="team-manager-section">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Collaborateurs</h1>
          <p className="text-slate-400">Gérez les membres de votre cabinet et leurs accès</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={csvInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleCsvImport}
          />
          <Button variant="outline" onClick={() => csvInputRef.current.click()}>
            <Upload className="w-4 h-4 mr-2" /> Importer CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button
            onClick={() => {
              setEditingMember(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Collaborateur
          </Button>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between"><p className="text-slate-400">Total</p><Briefcase className="w-6 h-6 text-slate-400" /></div>
          <p className="text-3xl font-bold text-white">{members.length}</p>
        </motion.div>
        {/* Utilise l'index combiné au rôle pour garantir l'unicité même avec des rôles dupliqués */}
        {Object.entries(roleCounts).slice(0, 3).map(([role, count], index) => (
          <motion.div key={`role-${role}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 1) * 0.1 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between"><p className="text-slate-400 capitalize">{role}</p><User className="w-6 h-6 text-green-400" /></div>
            <p className="text-3xl font-bold text-white">{count}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 print:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un collaborateur par nom, email ou rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {filteredMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            index={index}
            onEdit={(member) => {
              setEditingMember(member);
              setShowForm(true);
            }}
            onDelete={handleDeleteMember}
            onToggleStatus={toggleMemberStatus}
            isCurrentUser={member.id === currentUser.id}
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 print:hidden">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucun collaborateur trouvé</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un membre à votre équipe'}
          </p>
        </motion.div>
      )}

      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onSubmit={editingMember ? handleEditMember : handleAddMember}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      {/* Dialog pour afficher le mot de passe généré */}
      {passwordDialog.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closePasswordDialog}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icône de succès */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full">
              <User className="w-6 h-6 text-green-400" />
            </div>
            
            {/* Titre */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Collaborateur créé avec succès
            </h3>
            
            {/* Informations */}
            <div className="text-center mb-6">
              <p className="text-slate-300 mb-4">
                <strong>{passwordDialog.memberName}</strong> a été ajouté à l'équipe.
              </p>
              
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-2">Mot de passe temporaire :</p>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-lg text-green-400 text-center border border-slate-600">
                  {passwordDialog.password}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Notez ce mot de passe et communiquez-le au collaborateur
                </p>
              </div>
              
              <p className="text-sm text-yellow-400">
                ⚠️ Ce mot de passe ne sera affiché qu'une seule fois
              </p>
            </div>
            
            {/* Bouton de fermeture */}
            <div className="flex justify-center">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                onClick={closePasswordDialog}
              >
                J'ai noté le mot de passe
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

TeamManager.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

export default TeamManager;
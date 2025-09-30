import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Briefcase, User, Upload, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TeamMemberForm from '@/components/TeamMemberForm';
import TeamMemberCard from '@/components/TeamMemberCard';
import Papa from 'papaparse';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

const TeamManager = ({ currentUser }) => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const csvInputRef = useRef(null);
  const { signUp } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { rows: users } = await db.query('SELECT * FROM users');
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les collaborateurs." });
    } else {
      setMembers(data || []);
    }
  };

  const handleAddMember = async (memberData) => {
    const { error } = await signUp(memberData.email, 'password', {
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
      toast({ title: "✅ Collaborateur ajouté", description: `${memberData.name} a été invité. Le mot de passe par défaut est 'password'.` });
    }
  };

  const handleEditMember = async (memberData) => {
    if (!editingMember) return;
    // Correction: Use Supabase update query and proper error handling
    const { error, data } = await db
      .from('users')
      .update({
        name: memberData.name,
        email: memberData.email,
        role: memberData.role,
        title: memberData.title,
        function: memberData.function,
      })
      .eq('id', editingMember.id)
      .select();

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de modifier le collaborateur." });
    } else {
      setMembers(members.map(m => m.id === editingMember.id ? data[0] : m));
      setEditingMember(null);
      setShowForm(false);
      toast({ title: "✅ Collaborateur modifié", description: "Les informations ont été mises à jour." });
    }
  };

  const handleDeleteMember = async (_memberId) => {
    toast({ variant: "destructive", title: "Action non disponible", description: "La suppression d'utilisateurs doit être gérée depuis les paramètres d'administration de Supabase." });
  };

  const handlePrint = () => {
    window.print();
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
      (member.name && member.name.toLowerCase().includes(searchLower)) ||
      (member.email && member.email.toLowerCase().includes(searchLower)) ||
      (member.role && member.role.toLowerCase().includes(searchLower))
    );
  });

  const roleCounts = members.reduce((acc, member) => {
    if (member && member.role) {
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
        {Object.entries(roleCounts).slice(0, 3).map(([role, count], index) => (
          <motion.div key={role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 1) * 0.1 }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
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
    </div>
  );
};

export default TeamManager;
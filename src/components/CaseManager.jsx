import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CaseForm from "@/components/CaseForm";
import CaseCard from "@/components/CaseCard";
import { supabase } from "@/lib/customSupabaseClient";

const CaseManager = ({ currentUser }) => {
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const isGerantOrAssocie = currentUser?.function === "Gerant" || currentUser?.function === "Associe Emerite";
  const isAdmin = isGerantOrAssocie || currentUser?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setCases(isAdmin ? data : data.filter(c => 
          c.created_by === currentUser.id || 
          c.visible_to?.includes(currentUser.id)
        ));
      } catch (error) {
        console.error("Erreur lors du chargement des dossiers:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les dossiers."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [isAdmin, currentUser.id]);

  const validateCaseData = (data) => {
    if (!data.title?.trim()) {
      throw new Error("Le titre du dossier est requis");
    }
    if (!data.status) {
      throw new Error("Le statut du dossier est requis");
    }
    return true;
  };

  const handleAddCase = async (caseData) => {
    try {
      validateCaseData(caseData);
      const { data, error } = await supabase
        .from("cases")
        .insert([{ ...caseData, created_by: currentUser.id }])
        .select();

      if (error) throw error;

      setCases(prev => [data[0], ...prev]);
      setShowForm(false);
      toast({
        title: "✅ Dossier créé",
        description: `Le dossier ${data[0].id} a été créé avec succès.`
      });
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: error.message
      });
    }
  };

  const handleEditCase = async (caseData) => {
    try {
      validateCaseData(caseData);
      const { error } = await supabase
        .from("cases")
        .update(caseData)
        .match({ id: caseData.id });

      if (error) throw error;

      setCases(prev => prev.map(c => 
        c.id === caseData.id ? { ...c, ...caseData } : c
      ));
      setEditingCase(null);
      toast({
        title: "✅ Dossier modifié",
        description: "Les modifications ont été enregistrées."
      });
    } catch (error) {
      console.error("Erreur lors de la modification du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur de modification",
        description: error.message
      });
    }
  };

  const handleDeleteCase = async (caseId) => {
    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .match({ id: caseId });

      if (error) throw error;

      setCases(prev => prev.filter(c => c.id !== caseId));
      toast({
        title: "✅ Dossier supprimé",
        description: "Le dossier a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: error.message
      });
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (c.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Dossiers
          </h1>
          <p className="text-slate-400">
            Gérez vos dossiers et leur avancement.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Dossier
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="en_cours">En cours</option>
          <option value="en_attente">En attente</option>
          <option value="terminé">Terminé</option>
          <option value="archivé">Archivé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCases
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map(c => (
              <CaseCard
                key={c.id}
                caseData={c}
                onEdit={() => setEditingCase(c)}
                onDelete={() => handleDeleteCase(c.id)}
                currentUser={currentUser}
              />
            ))}
        </motion.div>
      )}

      {!isLoading && filteredCases.length > itemsPerPage && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-800/50"
          >
            Précédent
          </Button>
          <span className="px-4 py-2 text-white">
            Page {currentPage} sur {Math.ceil(filteredCases.length / itemsPerPage)}
          </span>
          <Button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCases.length / itemsPerPage), p + 1))}
            disabled={currentPage >= Math.ceil(filteredCases.length / itemsPerPage)}
            className="px-4 py-2 bg-slate-800/50"
          >
            Suivant
          </Button>
        </div>
      )}

      {(showForm || editingCase) && (
        <CaseForm
          isOpen={true}
          onClose={() => {
            setShowForm(false);
            setEditingCase(null);
          }}
          onSubmit={editingCase ? handleEditCase : handleAddCase}
          initialData={editingCase}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

CaseManager.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    function: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

export default CaseManager;

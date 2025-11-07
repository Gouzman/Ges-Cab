import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Building, User, Printer, X, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ClientForm from '@/components/ClientForm';
import supabase from '@/lib/customSupabaseClient';
import { Checkbox } from '@/components/ui/checkbox';
// Les importations DialogX ont été supprimées car non utilisées

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);

  // Fonction utilitaire pour générer le champ name
  const generateName = (clientData) => {
    if (clientData.type === 'company') {
      return clientData.company || 'Entreprise sans nom';
    }
    const firstName = (clientData.first_name || '').trim();
    const lastName = (clientData.last_name || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Client sans nom';
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les clients." });
    } else {
      setClients(data);
    }
  };

  const handleAddClient = async (clientData) => {
    // Générer le champ name requis
    const clientWithName = {
      ...clientData,
      name: generateName(clientData)
    };
    
    const { data, error } = await supabase.from('clients').insert([clientWithName]).select();
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le client." });
    } else {
      setClients([data[0], ...clients]);
      setShowForm(false);
      toast({ title: "✅ Client ajouté", description: "Le nouveau client a été ajouté avec succès." });
    }
  };

  const handleEditClient = async (clientData) => {
    // Générer le champ name requis
    const clientWithName = {
      ...clientData,
      name: generateName(clientData)
    };
    
    const { data, error } = await supabase.from('clients').update(clientWithName).eq('id', editingClient.id).select();
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de modifier le client." });
    } else {
      setClients(clients.map(c => c.id === editingClient.id ? data[0] : c));
      setEditingClient(null);
      setShowForm(false);
      toast({ title: "✅ Client modifié", description: "Les informations du client ont été mises à jour." });
    }
  };

  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le client." });
    } else {
      setClients(clients.filter(client => client.id !== clientId));
      toast({ title: "🗑️ Client supprimé", description: "Le client a été supprimé avec succès." });
    }
  };

  // ✅ Fonction pour gérer la sélection des clients à imprimer
  const handleSelectClient = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // ✅ Fonction pour sélectionner ou désélectionner tous les clients
  const handleSelectAllClients = (select) => {
    if (select) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  // ✅ Fonction pour imprimer les clients sélectionnés
  const handlePrintSelected = () => {
    if (selectedClients.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Aucun client sélectionné", 
        description: "Veuillez sélectionner au moins un client à imprimer." 
      });
      return;
    }

    // Créer une fenêtre d'impression pour les clients sélectionnés
    const printWindow = window.open('', '_blank');
    
    // Vérifier si la fenêtre a bien été ouverte
    if (!printWindow) {
      toast({ variant: "destructive", title: "Bloqueur de popup", description: "Veuillez autoriser les fenêtres pop-up pour imprimer." });
      return;
    }
    
    const clientsToPrint = clients.filter(client => selectedClients.includes(client.id));
    
    const htmlContent = `
      <html>
        <head>
          <title>Liste des Clients - Ges-Cab</title>
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
            <h1>Liste des Clients</h1>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody>
              ${clientsToPrint.map(client => `
                <tr>
                  <td>${client.name}</td>
                  <td>${client.email || '-'}</td>
                  <td>${client.phone || '-'}</td>
                  <td>${[client.address, client.city, client.country].filter(Boolean).join(', ') || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    try {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setShowPrintDialog(false);
      }, 250);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur d'impression", description: "Une erreur est survenue lors de l'impression." });
    }
  };
  
  // Fonction d'importation CSV (gardée pour référence mais désactivée dans l'interface)
  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const newClients = results.data.map(row => {
            const clientData = {
              type: row.type || 'individual',
              first_name: row.firstName || '',
              last_name: row.lastName || '',
              company: row.company || '',
              email: row.email || '',
              phone: row.phone || '',
              address: row.address || '',
              city: row.city || '',
              postal_code: row.postalCode || '',
              country: row.country || 'France',
              notes: row.notes || '',
            };
            // Générer le champ name requis
            clientData.name = generateName(clientData);
            return clientData;
          }).filter(c => c.first_name && c.last_name && c.email && c.phone);

          if (newClients.length > 0) {
            const { error } = await supabase.from('clients').insert(newClients);
            if (error) {
              toast({ variant: "destructive", title: "Erreur d'importation", description: error.message });
            } else {
              fetchClients();
              toast({ title: "✅ Importation réussie", description: `${newClients.length} clients ont été importés.` });
            }
          } else {
            toast({ variant: "destructive", title: "⚠️ Erreur d'importation", description: "Aucun client valide trouvé dans le fichier CSV." });
          }
        },
        error: (error) => {
          toast({ variant: "destructive", title: "❌ Erreur de lecture du fichier", description: error.message });
        }
      });
    }
    event.target.value = '';
  };

  // Fonctions d'aide pour les types de clients
  const getClientTypeClass = (type) => {
    switch (type) {
      case 'company': return 'bg-blue-100 text-blue-800';
      case 'individual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getClientTypeText = (type) => {
    switch (type) {
      case 'company': return 'Entreprise';
      case 'individual': return 'Particulier';
      default: return 'Non défini';
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6" id="client-manager-section">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Clients</h1>
          <p className="text-slate-400">Gérez votre portefeuille client</p>
        </div>
        {/* ✅ Suppression de l'option "Importer CSV" du menu */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button
            onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </Button>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Clients</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
            <User className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Entreprises</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.type === 'company').length}
              </p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Particuliers</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.type === 'individual').length}
              </p>
            </div>
            <User className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 print:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, email, téléphone ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* ✅ Modification demandée : présentation des clients sous forme de liste comme pour les factures */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">
                <div className="flex items-center">
                  <Checkbox 
                    id="select-all"
                    className="mr-2"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onCheckedChange={(checked) => handleSelectAllClients(checked)}
                  />
                  Client
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Adresse</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, index) => (
              <tr key={client.id} className={index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/60'}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id={`select-client-${client.id}`}
                      className="mr-3"
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => handleSelectClient(client.id)}
                    />
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${client.type === 'company' ? 'bg-blue-400/10' : 'bg-green-400/10'}`}>
                      {client.type === 'company' ? (
                        <Building className="h-6 w-6 text-blue-400" />
                      ) : (
                        <User className="h-6 w-6 text-green-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {client.type === 'company' ? client.company : `${client.first_name} ${client.last_name}`}
                      </div>
                      {client.type === 'company' && client.first_name && client.last_name && (
                        <div className="text-sm text-slate-400">Contact: {client.first_name} {client.last_name}</div>
                      )}
                      <div className="text-xs text-slate-400">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block ${getClientTypeClass(client.type)}`}>
                          {getClientTypeText(client.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {client.email && (
                      <div className="flex items-center text-slate-300 mb-1">
                        <Mail className="w-3 h-3 mr-2" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center text-slate-300">
                        <Phone className="w-3 h-3 mr-2" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-300">
                    {[client.address, client.city, client.postal_code, client.country]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setShowForm(true);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-slate-700/50"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
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

      {filteredClients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 print:hidden"
        >
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucun client trouvé</h3>
          <p className="text-slate-500">
            {searchTerm
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par ajouter votre premier client'
            }
          </p>
        </motion.div>
      )}

      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleEditClient : handleAddClient}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
      
      {/* ✅ Ajout du formulaire d'impression pour les clients */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Imprimer des clients</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPrintDialog(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-300">Sélectionnez les clients à imprimer :</p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllClients(true)}
                >
                  Tout sélectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllClients(false)}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="w-16 p-3 text-left"></th>
                    <th className="p-3 text-left text-white">Nom</th>
                    <th className="p-3 text-left text-white">Email</th>
                    <th className="p-3 text-left text-white">Téléphone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, index) => (
                    <tr 
                      key={client.id} 
                      className={index % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/60"}
                    >
                      <td className="p-3">
                        <Checkbox 
                          checked={selectedClients.includes(client.id)} 
                          onCheckedChange={() => handleSelectClient(client.id)}
                        />
                      </td>
                      <td className="p-3 text-white">{client.name}</td>
                      <td className="p-3 text-slate-300">{client.email}</td>
                      <td className="p-3 text-slate-300">{client.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowPrintDialog(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handlePrintSelected}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer sélection ({selectedClients.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
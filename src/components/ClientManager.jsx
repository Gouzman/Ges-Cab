import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Building, User, Upload, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ClientForm from '@/components/ClientForm';
import ClientCard from '@/components/ClientCard';
import Papa from 'papaparse';
import { supabase } from '@/lib/customSupabaseClient';

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const csvInputRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: rows, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients(rows || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: `Impossible de charger les clients: ${error.message || 'Erreur inconnue'}` 
      });
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      // Version temporaire avec seulement les colonnes de base existantes
      const dbData = {
        name: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || clientData.company || 'Client',
        company: clientData.company || '',
        email: clientData.email || '',
        phone: clientData.phone || ''
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert([dbData])
        .select();
      
      if (error) throw error;
      
      setClients([data[0], ...clients]);
      setShowForm(false);
      toast({ title: "✅ Client ajouté", description: "Le nouveau client a été ajouté avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le client." });
    }
  };

  const handleEditClient = async (clientData) => {
    try {
      // Version temporaire avec seulement les colonnes de base existantes
      const dbData = {
        name: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || clientData.company || 'Client',
        company: clientData.company || '',
        email: clientData.email || '',
        phone: clientData.phone || ''
      };
      
      const { data, error } = await supabase.from('clients').update(dbData).eq('id', editingClient.id).select();
      
      if (error) throw error;
      
      setClients(clients.map(c => c.id === editingClient.id ? data[0] : c));
      setEditingClient(null);
      setShowForm(false);
      toast({ title: "✅ Client modifié", description: "Les informations du client ont été mises à jour." });
    } catch (error) {
      console.error("Erreur lors de la modification du client:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de modifier le client." });
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
          const newClients = results.data.map(row => ({
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
          })).filter(c => c.first_name && c.last_name && c.email && c.phone);

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

      <div className="bg-cabinet-surface/20 backdrop-blur-sm border border-cabinet-border rounded-xl p-6 print:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, email, téléphone ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cabinet-surface border-2 border-cabinet-border rounded-lg text-cabinet-text placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {filteredClients.map((client, index) => (
          <ClientCard
            key={client.id}
            client={client}
            index={index}
            onEdit={(client) => {
              setEditingClient(client);
              setShowForm(true);
            }}
            onDelete={handleDeleteClient}
          />
        ))}
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
    </div>
  );
};

export default ClientManager;
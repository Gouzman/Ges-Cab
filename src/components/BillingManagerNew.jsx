import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Eye, Calendar, User, FileText, Check, X, Receipt } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { checkPermission, getDefaultPermissionsByRole } from '@/lib/permissions';

const BillingManager = ({ currentUser }) => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Obtenir les permissions de l'utilisateur
  const userPermissions = currentUser ? getDefaultPermissionsByRole(currentUser.role || currentUser.function) : {};
  
  const canCreate = checkPermission(userPermissions, 'billing', 'create');
  const canEdit = checkPermission(userPermissions, 'billing', 'edit');
  const canDelete = checkPermission(userPermissions, 'billing', 'delete');
  const canView = checkPermission(userPermissions, 'billing');

  useEffect(() => {
    if (canView) {
      fetchInvoices();
      fetchClients();
    }
  }, [canView]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices_with_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors du chargement des factures" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, company, email')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  // Composant d'édition inline pour le montant
  const EditableAmount = ({ invoice, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(invoice.amount || 0);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      if (!canEdit) {
        toast({ variant: "destructive", title: "Permissions insuffisantes", description: "Vous n'avez pas les permissions pour modifier cette facture" });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase
          .from('invoices')
          .update({ 
            amount: parseFloat(amount),
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);

        if (error) throw error;

        toast({ title: "✅ Montant mis à jour", description: "Le montant a été mis à jour avec succès" });
        setIsEditing(false);
        onUpdate();
      } catch (error) {
        console.error('Erreur:', error);
        toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour" });
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      setAmount(invoice.amount || 0);
      setIsEditing(false);
    };

    if (!canEdit) {
      return (
        <span className="text-2xl font-bold text-green-600">
          {parseFloat(invoice.amount || 0).toFixed(2)} €
        </span>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
              disabled={loading}
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold text-green-600">
              {parseFloat(invoice.amount || 0).toFixed(2)} €
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  // Formulaire de création/édition
  const InvoiceForm = ({ invoice, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      client_id: invoice?.client_id || '',
      title: invoice?.title || '',
      description: invoice?.description || '',
      amount: invoice?.amount || 0,
      status: invoice?.status || 'draft',
      issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const dataToSave = {
          ...formData,
          amount: parseFloat(formData.amount),
          created_by: currentUser.id
        };

        let result;
        if (invoice) {
          // Mise à jour
          result = await supabase
            .from('invoices')
            .update(dataToSave)
            .eq('id', invoice.id);
        } else {
          // Création
          result = await supabase
            .from('invoices')
            .insert([dataToSave]);
        }

        if (result.error) throw result.error;

        toast({ title: invoice ? "✅ Facture mise à jour" : "✅ Facture créée", description: invoice ? "La facture a été mise à jour" : "La facture a été créée avec succès" });
        onSave();
        onClose();
      } catch (error) {
        console.error('Erreur:', error);
        toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la sauvegarde" });
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="cabinet-card rounded-lg p-6 w-full max-w-md m-4"
        >
          <h3 className="text-lg font-semibold mb-4">
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name || 'Client sans nom'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date d'émission</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-cabinet-text hover:bg-cabinet-surface rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                {invoice ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const getStatusBadge = (status) => {
    const configs = {
      draft: { bg: 'bg-cabinet-surface', text: 'text-cabinet-text', label: 'Brouillon' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Envoyée' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payée' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'En retard' },
      cancelled: { bg: 'bg-cabinet-surface', text: 'text-muted-foreground', label: 'Annulée' }
    };
    
    const config = configs[status] || configs.draft;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_info?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à la facturation.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Facturation</h1>
        <p className="text-gray-600">Gérez vos factures et paiements</p>
      </div>

      {/* En-tête avec recherche et actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-cabinet-surface border border-cabinet-border rounded-lg text-cabinet-text placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-cabinet-surface border border-cabinet-border rounded-lg text-cabinet-text focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="sent">Envoyées</option>
            <option value="paid">Payées</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle facture</span>
          </button>
        )}
      </div>

      {/* Liste des factures */}
      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre première facture</p>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Créer une facture
              </button>
            )}
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cabinet-card border border-cabinet-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{invoice.title}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{invoice.client_info || 'Client non défini'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>N° {invoice.invoice_number}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <EditableAmount 
                    invoice={invoice} 
                    onUpdate={fetchInvoices}
                  />
                  
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canDelete && (
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onSave={fetchInvoices}
        />
      )}
    </div>
  );
};

export default BillingManager;
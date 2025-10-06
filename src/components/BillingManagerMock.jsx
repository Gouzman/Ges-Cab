import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Receipt, Printer, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import InvoiceForm from '@/components/InvoiceForm';
import { generateInvoicePDF } from '@/lib/pdfGenerator';

const formatCurrency = (value) => {
  if (isNaN(value) || value === null) return '0';
  return new Intl.NumberFormat('fr-FR').format(value);
};

const getInvoiceStatus = (invoice) => {
  const totalTTC = invoice.totalTTC || 0;
  const provisionAmount = invoice.payment?.provisionAmount || 0;

  if (!invoice.payment?.provision || provisionAmount <= 0) {
    return 'non réglée';
  }
  if (provisionAmount >= totalTTC) {
    return 'réglée totalement';
  }
  return 'réglée partiellement';
};

const BillingManager = ({ currentUser }) => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    toast({
      title: "Chargement des factures...",
      description: "Cette fonctionnalité nécessite une base de données pour fonctionner. Des données de démonstration sont affichées.",
    });
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: 'FACT-2025-001',
        clientName: 'Société Alpha',
        caseId: 'D-001',
        totalTTC: 1770000,
        date: '2025-09-15',
        debours: { entrevue: 50000, dossier: 100000, plaidoirie: 0, huissier: 0, deplacement: 0 },
        honoraires: { forfait: 1350000, tauxHoraire: 0, base: 0, resultat: 0 },
        payment: { method: 'virement', provision: true, provisionAmount: 1770000 },
      },
      {
        id: 2,
        invoiceNumber: 'FACT-2025-002',
        clientName: 'Monsieur Beta',
        caseId: 'D-002',
        totalTTC: 590000,
        date: '2025-09-20',
        debours: { entrevue: 50000, dossier: 0, plaidoirie: 0, huissier: 0, deplacement: 0 },
        honoraires: { forfait: 0, tauxHoraire: 0, base: 450000, resultat: 0 },
        payment: { method: 'cheque', provision: true, provisionAmount: 200000 },
      },
      {
        id: 3,
        invoiceNumber: 'FACT-2025-003',
        clientName: 'Entreprise Gamma',
        caseId: 'D-003',
        totalTTC: 885000,
        date: '2025-08-10',
        debours: { entrevue: 0, dossier: 0, plaidoirie: 0, huissier: 0, deplacement: 0 },
        honoraires: { forfait: 750000, tauxHoraire: 0, base: 0, resultat: 0 },
        payment: { method: 'virement', provision: false, provisionAmount: 0 },
      }
    ];
    setInvoices(mockInvoices.map(inv => ({ ...inv, status: getInvoiceStatus(inv) })));
  };

  const handleAddInvoice = async (formData) => {
    try {
      const newInvoice = {
        ...formData,
        id: Date.now(), // ID temporaire
        invoiceNumber: `FACT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        status: getInvoiceStatus(formData)
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      setShowForm(false);
      
      toast({
        title: "✅ Facture créée avec succès",
        description: `Facture ${newInvoice.invoiceNumber} créée pour ${newInvoice.clientName}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la facture. Veuillez réessayer.",
      });
    }
  };

  const handleEditInvoice = async (formData) => {
    try {
      const updatedInvoice = {
        ...formData,
        id: editingInvoice.id,
        invoiceNumber: editingInvoice.invoiceNumber,
        date: editingInvoice.date,
        status: getInvoiceStatus(formData)
      };
      
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id ? updatedInvoice : inv
      ));
      setEditingInvoice(null);
      setShowForm(false);
      
      toast({
        title: "✅ Facture modifiée avec succès",
        description: `Facture ${updatedInvoice.invoiceNumber} mise à jour`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la facture. Veuillez réessayer.",
      });
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    try {
      if (!invoiceToDelete) return;
      
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      
      toast({
        title: "🗑️ Facture supprimée",
        description: `Facture ${invoiceToDelete.invoiceNumber} supprimée avec succès`,
      });
      
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la facture. Veuillez réessayer.",
      });
    }
  };

  const handlePrint = (invoice) => {
    try {
      if (!invoice || !invoice.invoiceNumber) {
        throw new Error('Données de facture invalides');
      }
      
      generateInvoicePDF(invoice);
      
      toast({
        title: "🖨️ Impression en cours...",
        description: `Génération PDF de la facture ${invoice.invoiceNumber} pour impression.`,
      });
    } catch (error) {
      console.error('Erreur d\'impression:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'impression",
        description: error.message || "Impossible d'imprimer la facture. Veuillez réessayer.",
      });
      console.error('Erreur d\'impression:', error);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(invoice => {
        const searchMatch = (invoice.clientName && invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        return searchMatch;
      })
      .filter(invoice => {
        if (statusFilter === 'all') return true;
        return invoice.status === statusFilter;
      });
  }, [invoices, searchTerm, statusFilter]);

  const statusColors = {
    'réglée totalement': 'bg-green-500',
    'réglée partiellement': 'bg-yellow-500',
    'non réglée': 'bg-red-500',
  };

  const filterOptions = [
    { id: 'all', label: 'Toutes' },
    { id: 'non réglée', label: 'Non réglées' },
    { id: 'réglée partiellement', label: 'Partiellement réglées' },
    { id: 'réglée totalement', label: 'Totalement réglées' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-cabinet-text mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Gestion de la Facturation</h1>
          <p className="text-muted">Créez et suivez vos factures et honoraires.</p>
        </div>
        <Button
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
          className="bg-btn-primary hover:opacity-90 text-cabinet-text shadow-cabinet-focus"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      <div className="cabinet-card rounded-xl p-6 print:hidden space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une facture par client ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-cabinet-border rounded-lg text-cabinet-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <p className="text-sm font-medium text-cabinet-text mr-2">Filtrer par statut:</p>
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setStatusFilter(option.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                statusFilter === option.id
                  ? 'bg-primary text-cabinet-text font-semibold shadow-cabinet-focus'
                  : 'bg-secondary text-muted hover:bg-secondary/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(invoice => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 flex items-center justify-between print:hidden"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <Receipt className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{invoice.invoiceNumber} - {invoice.clientName}</p>
                  <p className="text-sm text-slate-400">
                    Total: {formatCurrency(invoice.totalTTC)} F CFA | Date: {invoice.date}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[invoice.status]}`}>
                  <span className="w-2 h-2 rounded-full bg-cabinet-text"></span>
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handlePrint(invoice)}
                  title="Imprimer la facture"
                >
                  <Printer className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}
                  title="Modifier la facture"
                >
                  <Edit className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteInvoice(invoice.id)}
                  title="Supprimer la facture"
                >
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 print:hidden"
          >
            <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucune facture trouvée</h3>
            <p className="text-slate-500">Ajustez vos filtres ou créez une nouvelle facture.</p>
          </motion.div>
        )}
      </div>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onSubmit={editingInvoice ? handleEditInvoice : handleAddInvoice}
          onCancel={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onPrint={() => handlePrint(editingInvoice)}
          currentUser={currentUser}
        />
      )}

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer la facture{' '}
              <span className="font-semibold text-gray-900">
                {invoiceToDelete?.invoiceNumber}
              </span>{' '}
              ?
              <br />
              <span className="text-sm text-red-500 mt-2 block">
                Cette action est irréversible.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              className="bg-cabinet-surface hover:bg-cabinet-border text-cabinet-text"
              onClick={() => {
                setDeleteDialogOpen(false);
                setInvoiceToDelete(null);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInvoice}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BillingManager;
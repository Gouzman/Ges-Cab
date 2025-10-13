import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Plus, Search, Receipt, Printer, Edit, Trash2, Filter, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import InvoiceForm from '@/components/InvoiceForm';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, invoice: null });
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

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
        date: '10/01/2025',
        payment: { provision: true, provisionAmount: 1770000 },
        details: [
          { description: 'Consultation initiale', amount: 500000 },
          { description: 'Préparation dossier', amount: 1000000 },
          { description: 'Frais de procédure', amount: 270000 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'FACT-2025-002',
        clientName: 'M. Martin Dupont',
        caseId: 'D-002',
        totalTTC: 850000,
        date: '15/01/2025',
        payment: { provision: true, provisionAmount: 400000 },
        details: [
          { description: 'Consultation', amount: 350000 },
          { description: 'Rédaction contrat', amount: 500000 }
        ]
      },
      {
        id: 3,
        invoiceNumber: 'FACT-2025-003',
        clientName: 'Entreprise Beta',
        caseId: 'D-003',
        totalTTC: 2500000,
        date: '22/01/2025',
        payment: { provision: false, provisionAmount: 0 },
        details: [
          { description: 'Médiation commerciale', amount: 1500000 },
          { description: 'Analyse juridique', amount: 750000 },
          { description: 'Frais administratifs', amount: 250000 }
        ]
      }
    ];

    mockInvoices.forEach(invoice => {
      invoice.status = getInvoiceStatus(invoice);
    });
    
    setInvoices(mockInvoices);
  };

  const handleAddInvoice = (invoiceData) => {
    const newInvoice = {
      id: Math.max(...invoices.map(i => i.id)) + 1,
      ...invoiceData,
      invoiceNumber: `FACT-2025-${(invoices.length + 1).toString().padStart(3, '0')}`,
      status: getInvoiceStatus(invoiceData)
    };

    setInvoices([newInvoice, ...invoices]);
    setShowForm(false);
    toast({ title: "✅ Facture créée", description: "La facture a été créée avec succès." });
  };

  const handleEditInvoice = (invoiceData) => {
    const updatedInvoice = { 
      ...invoiceData,
      status: getInvoiceStatus(invoiceData)
    };

    setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv));
    setEditingInvoice(null);
    setShowForm(false);
    toast({ title: "✅ Facture modifiée", description: "La facture a été modifiée avec succès." });
  };

  const handleDeleteInvoice = (invoice) => {
    setDeleteDialog({ isOpen: true, invoice });
  };

  const confirmDeleteInvoice = () => {
    setInvoices(invoices.filter(inv => inv.id !== deleteDialog.invoice.id));
    setDeleteDialog({ isOpen: false, invoice: null });
    toast({ title: "🗑️ Facture supprimée", description: "La facture a été supprimée avec succès." });
  };

  // ✅ Fonction pour gérer la sélection des factures à imprimer
  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  // ✅ Fonction pour sélectionner ou désélectionner toutes les factures
  const handleSelectAllInvoices = (select) => {
    if (select) {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // ✅ Fonction pour imprimer les factures sélectionnées
  const handlePrintSelected = () => {
    if (selectedInvoices.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune facture sélectionnée",
        description: "Veuillez sélectionner au moins une facture à imprimer."
      });
      return;
    }

    // Créer une fenêtre d'impression pour les factures sélectionnées
    const printWindow = window.open('', '_blank');
    
    // Vérifier si la fenêtre a bien été ouverte
    if (!printWindow) {
      toast({ variant: "destructive", title: "Bloqueur de popup", description: "Veuillez autoriser les fenêtres pop-up pour imprimer." });
      return;
    }
    
    const invoicesToPrint = invoices.filter(invoice => selectedInvoices.includes(invoice.id));
    
    const htmlContent = `
      <html>
        <head>
          <title>Liste des Factures - Ges-Cab</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f2f2f2; padding: 10px; text-align: left; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .date { margin-top: 10px; text-align: right; font-style: italic; }
            .amount { text-align: right; }
            .status { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste des Factures</h1>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant TTC</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesToPrint.map(invoice => `
                <tr>
                  <td>${invoice.invoiceNumber}</td>
                  <td>${invoice.clientName}</td>
                  <td>${invoice.date}</td>
                  <td class="amount">${formatCurrency(invoice.totalTTC)} FCFA</td>
                  <td class="status">${invoice.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setShowPrintDialog(false);
    }, 250);
  };

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    
    // Vérifier si la fenêtre a bien été ouverte
    if (!printWindow) {
      toast({ variant: "destructive", title: "Bloqueur de popup", description: "Veuillez autoriser les fenêtres pop-up pour imprimer." });
      return;
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>FACTURE ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #333; }
            h2 { color: #666; }
            .invoice-details { border: 1px solid #ddd; padding: 20px; }
            .amount { font-weight: bold; color: #000; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE</h1>
            <h2>${invoice.invoiceNumber}</h2>
          </div>
          <div class="invoice-details">
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Dossier:</strong> ${invoice.caseId}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <p class="amount"><strong>Montant TTC:</strong> ${formatCurrency(invoice.totalTTC)} FCFA</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.documentElement.innerHTML = htmlContent;
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(invoice => {
        const searchMatch = invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion de la Facturation</h1>
          <p className="text-slate-400">Créez et suivez vos factures et honoraires.</p>
        </div>
        <div className="flex gap-2">
          {/* ✅ Ajout du bouton Imprimer */}
          <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 print:hidden space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une facture par client ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-300 mr-2">Filtrer par statut:</p>
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setStatusFilter(option.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                statusFilter === option.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(invoice)}>
                  <Printer className="w-4 h-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}>
                  <Edit className="w-4 h-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
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
          onCancel={() => { setShowForm(false); setEditingInvoice(null); }}
        />
      )}

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
            <p className="text-slate-300 mb-6">
              Êtes-vous sûr de vouloir supprimer la facture {deleteDialog.invoice.invoiceNumber} ?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, invoice: null })}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDeleteInvoice}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Ajout du formulaire d'impression pour les factures */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Imprimer des factures</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPrintDialog(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-300">Sélectionnez les factures à imprimer :</p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllInvoices(true)}
                >
                  Tout sélectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllInvoices(false)}
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
                    <th className="p-3 text-left text-white">N° Facture</th>
                    <th className="p-3 text-left text-white">Client</th>
                    <th className="p-3 text-left text-white">Date</th>
                    <th className="p-3 text-right text-white">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr 
                      key={invoice.id} 
                      className={index % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/60"}
                    >
                      <td className="p-3">
                        <Checkbox 
                          checked={selectedInvoices.includes(invoice.id)} 
                          onCheckedChange={() => handleSelectInvoice(invoice.id)}
                        />
                      </td>
                      <td className="p-3 text-white">{invoice.invoiceNumber}</td>
                      <td className="p-3 text-white">{invoice.clientName}</td>
                      <td className="p-3 text-slate-300">{invoice.date}</td>
                      <td className="p-3 text-slate-300 text-right">{formatCurrency(invoice.totalTTC)} FCFA</td>
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
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer sélection ({selectedInvoices.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BillingManager.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};

export default BillingManager;
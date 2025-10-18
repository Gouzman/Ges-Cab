import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Plus, Search, Receipt, Printer, Edit, Trash2, Filter, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import InvoiceForm from '@/components/InvoiceForm';

// ✅ Modification : Style pour l'impression format A4
const printStyles = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #invoice-print-view {
      display: block !important;
      font-family: 'Inter', 'Roboto', 'Open Sans', sans-serif;
    }
    .print\\:block {
      display: block !important;
    }
    .print\\:hidden {
      display: none !important;
    }
  }
`;

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

const BillingManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, invoice: null });
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // ✅ Injecter les styles d'impression dans le DOM
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(printStyles));
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Simulation de chargement des factures depuis une API
    setTimeout(() => {
      const mockInvoices = [
        {
          id: 'inv-001',
          invoiceNumber: 'FACT-2023-001',
          date: '2023-10-01',
          dueDate: '2023-10-15',
          clientName: 'SARL Exemple',
          clientAddress: 'Avenue de la Liberté, Ouagadougou',
          clientContact: '+226 XX XX XX XX',
          clientIFU: '00123456789',
          caseId: 'AFF-2023-001',
          reference: 'REF-2023-001',
          debours: {
            'Frais de dossier': 25000,
            'Copies': 5000,
            'Déplacements': 15000
          },
          honoraires: {
            'Consultations': 100000,
            'Rédaction': 150000
          },
          payment: {
            method: 'Virement bancaire',
            provision: true,
            provisionAmount: 295000
          },
          totalTTC: 295000,
          amountInWords: 'Deux cent quatre-vingt-quinze mille francs CFA',
          status: 'réglée totalement'
        },
        {
          id: 'inv-002',
          invoiceNumber: 'FACT-2023-002',
          date: '2023-10-05',
          dueDate: '2023-10-20',
          clientName: 'Entreprise ABC',
          clientAddress: 'Rue du Commerce, Ouagadougou',
          clientContact: '+226 XX XX XX XX',
          clientIFU: '00987654321',
          caseId: 'AFF-2023-002',
          reference: 'REF-2023-002',
          debours: {
            'Frais de dossier': 30000,
            'Copies': 8000,
            'Déplacements': 20000
          },
          honoraires: {
            'Consultations': 150000,
            'Rédaction': 200000,
            'Plaidoirie': 250000
          },
          payment: {
            method: 'Chèque',
            provision: true,
            provisionAmount: 300000
          },
          totalTTC: 658000,
          amountInWords: 'Six cent cinquante-huit mille francs CFA',
          status: 'réglée partiellement'
        },
        {
          id: 'inv-003',
          invoiceNumber: 'FACT-2023-003',
          date: '2023-10-10',
          dueDate: '2023-10-25',
          clientName: 'M. Ouédraogo',
          clientAddress: 'Quartier Zogona, Ouagadougou',
          clientIFU: 'N/A',
          caseId: 'AFF-2023-003',
          reference: 'REF-2023-003',
          debours: {
            'Frais de dossier': 15000,
            'Copies': 2000
          },
          honoraires: {
            'Consultations': 50000,
            'Rédaction': 75000
          },
          payment: {
            method: 'Espèces',
            provision: false,
            provisionAmount: 0
          },
          totalTTC: 142000,
          amountInWords: 'Cent quarante-deux mille francs CFA',
          status: 'non réglée'
        }
      ];

      mockInvoices.forEach(invoice => {
        invoice.status = getInvoiceStatus(invoice);
      });

      setInvoices(mockInvoices);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateInvoice = (newInvoice) => {
    newInvoice.id = `inv-${Date.now()}`;
    newInvoice.invoiceNumber = `FACT-${new Date().getFullYear()}-${invoices.length + 1}`.padStart(3, '0');
    newInvoice.status = getInvoiceStatus(newInvoice);
    
    setInvoices([...invoices, newInvoice]);
    setShowForm(false);
    toast({ title: "✅ Facture créée", description: `La facture ${newInvoice.invoiceNumber} a été créée avec succès.` });
  };

  const handleEditInvoice = (updatedInvoice) => {
    updatedInvoice.status = getInvoiceStatus(updatedInvoice);
    
    setInvoices(invoices.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    setEditingInvoice(null);
    toast({ title: "✅ Facture mise à jour", description: `La facture ${updatedInvoice.invoiceNumber} a été mise à jour.` });
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoices(invoices.filter(inv => inv.id !== invoice.id));
    setDeleteDialog({ isOpen: false, invoice: null });
    toast({ title: "🗑️ Facture supprimée", description: `La facture ${invoice.invoiceNumber} a été supprimée.` });
  };
  
  const handleShowInvoicePreview = (invoice) => {
    setPreviewInvoice(invoice);
    
    // Afficher directement l'aperçu d'impression sans popup intermédiaire
    setTimeout(() => {
      const printContent = document.getElementById('invoice-print-view');
      if (printContent) {
        window.print();
      }
    }, 250);
  };

  const handlePrintInvoice = (invoice) => {
    // Affichage du toast avant l'impression
    toast({ 
      title: "🖨️ Impression en cours", 
      description: `Préparation de la facture ${invoice.invoiceNumber} pour impression.`,
      duration: 2000
    });
    
    // Déclencher l'impression avec un léger délai
    handleShowInvoicePreview(invoice);
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
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3">
              <Filter className="text-slate-400 w-5 h-5" />
              <span className="text-slate-300">Statut:</span>
              <div className="flex gap-1">
                {filterOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setStatusFilter(option.id)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      statusFilter === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 print:hidden">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center text-slate-400 mt-4">Chargement des factures...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center print:hidden">
          <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucune facture trouvée</h3>
          <p className="text-slate-500 mb-6">Commencez par créer une nouvelle facture.</p>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Créer une facture
          </Button>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-4 text-slate-300 font-medium">Numéro</th>
                  <th className="p-4 text-slate-300 font-medium">Client</th>
                  <th className="p-4 text-slate-300 font-medium">Date</th>
                  <th className="p-4 text-slate-300 font-medium">Montant</th>
                  <th className="p-4 text-slate-300 font-medium">Statut</th>
                  <th className="p-4 text-slate-300 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/20"
                  >
                    <td className="p-4 text-white font-medium">{invoice.invoiceNumber}</td>
                    <td className="p-4 text-slate-300">{invoice.clientName}</td>
                    <td className="p-4 text-slate-400">{invoice.date}</td>
                    <td className="p-4 text-white font-medium">{formatCurrency(invoice.totalTTC)} FCFA</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Imprimer"
                        >
                          <Printer className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingInvoice(invoice)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteDialog({ isOpen: true, invoice })}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulaire de création/édition */}
      {(showForm || editingInvoice) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingInvoice ? "Modifier la facture" : "Nouvelle facture"}</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setEditingInvoice(null);
                }}
              >
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            
            <InvoiceForm 
              invoice={editingInvoice} 
              onSubmit={editingInvoice ? handleEditInvoice : handleCreateInvoice}
              onPrint={() => editingInvoice && handleShowInvoicePreview(editingInvoice)}
            />
          </motion.div>
        </div>
      )}

      {/* Dialogue de confirmation de suppression */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h2>
            <p className="text-slate-300 mb-6">Êtes-vous sûr de vouloir supprimer la facture <strong>{deleteDialog.invoice?.invoiceNumber}</strong> ? Cette action est irréversible.</p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialog({ isOpen: false, invoice: null })}
              >
                Annuler
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDeleteInvoice(deleteDialog.invoice)}
              >
                Supprimer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Aperçu d'impression */}
      {previewInvoice && (
        <div id="invoice-print-view" className="hidden print:block print:m-0 print:p-0">
          <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-10 font-[Inter,Roboto,sans-serif] print:shadow-none">
            {/* En-tête avec couleurs officielles */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-green-700 pb-6">
              <div className="flex items-center">
                <div className="mr-4">
                  {/* Logo avec couleurs du drapeau Burkinabé */}
                  <div className="w-24 h-24 bg-white border-2 border-green-700 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-red-600 flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-xs">CABINET</span>
                    </div>
                    <div className="h-1/2 bg-green-700 flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-xs">JURIDIQUE</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-green-800">CABINET D'AVOCATS</h1>
                  <p className="text-sm text-gray-700">Avenue de la Liberté, 01 BP 1234</p>
                  <p className="text-sm text-gray-700">Ouagadougou 01, Burkina Faso</p>
                  <p className="text-sm text-gray-700">Tél: +226 XX XX XX XX | Email: cabinet@exemple.com</p>
                  <p className="text-sm text-gray-700">RCCM: BF-OUA-2023-A-1234 | IFU: 12345678901</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-green-800 border-b-2 border-green-800 pb-1 mb-2 inline-block">FACTURE</h2>
                <p className="font-medium">{previewInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-700">Date: {previewInvoice.date}</p>
                <p className="text-sm text-gray-700 mt-1">Ref: {previewInvoice.reference || previewInvoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Informations client */}
            <div className="mb-8 flex justify-between">
              <div className="w-1/2">
                <h3 className="text-sm font-bold uppercase text-green-700 mb-2">Facturer à:</h3>
                <div className="border-2 border-gray-200 p-4 bg-gray-50 rounded-md shadow-sm">
                  <p className="font-bold text-lg">{previewInvoice.clientName}</p>
                  <p className="text-sm my-1">
                    <span className="font-semibold">Dossier:</span> {previewInvoice.caseId || 'Non spécifié'}
                  </p>
                  <p className="text-sm my-1">
                    <span className="font-semibold">Adresse:</span> {previewInvoice.clientAddress || 'Ouagadougou, Burkina Faso'}
                  </p>
                  {previewInvoice.clientContact && (
                    <p className="text-sm my-1">
                      <span className="font-semibold">Contact:</span> {previewInvoice.clientContact}
                    </p>
                  )}
                  {previewInvoice.clientIFU && (
                    <p className="text-sm my-1">
                      <span className="font-semibold">IFU:</span> {previewInvoice.clientIFU}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-1/3">
                <h3 className="text-sm font-bold uppercase text-green-700 mb-2">Détails du paiement:</h3>
                <div className="border-2 border-gray-200 p-4 rounded-md shadow-sm bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="font-medium py-1 border-b border-gray-100">Mode de paiement:</td>
                        <td className="text-right py-1 border-b border-gray-100">{previewInvoice.payment?.method || 'Non spécifié'}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1">Statut:</td>
                        <td className={`text-right font-medium py-1 ${
                          previewInvoice.status === 'réglée totalement' ? 'text-green-600' : 
                          previewInvoice.status === 'réglée partiellement' ? 'text-amber-600' : 
                          'text-red-600'
                        }`}>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            previewInvoice.status === 'réglée totalement' ? 'bg-green-100' : 
                            previewInvoice.status === 'réglée partiellement' ? 'bg-amber-100' : 
                            'bg-red-100'
                          }`}>
                            {previewInvoice.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1 pt-2">Date d'échéance:</td>
                        <td className="text-right py-1 pt-2">{previewInvoice.dueDate || 'À réception'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-green-700 mb-2">Détail des prestations:</h3>
              <table className="w-full border-collapse text-sm shadow-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border-2 border-green-100 p-3 text-left font-bold text-green-800">Désignation</th>
                    <th className="border-2 border-green-100 p-3 text-center font-bold text-green-800" width="10%">Quantité</th>
                    <th className="border-2 border-green-100 p-3 text-right font-bold text-green-800" width="22%">Prix Unitaire (FCFA)</th>
                    <th className="border-2 border-green-100 p-3 text-right font-bold text-green-800" width="22%">Montant (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Débours */}
                  {previewInvoice.debours && Object.entries(previewInvoice.debours)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value], index) => (
                      <tr key={`debours-${index}`} className={`border-b border-green-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="border border-gray-200 p-3">Débours - {key}</td>
                        <td className="border border-gray-200 p-3 text-center">1</td>
                        <td className="border border-gray-200 p-3 text-right font-medium">{formatCurrency(value)}</td>
                        <td className="border border-gray-200 p-3 text-right font-medium">{formatCurrency(value)}</td>
                      </tr>
                    ))
                  }
                  
                  {/* Honoraires */}
                  {previewInvoice.honoraires && Object.entries(previewInvoice.honoraires)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value], index) => (
                      <tr key={`honor-${index}`} className={`border-b border-green-50 ${
                        (index + (previewInvoice.debours ? Object.values(previewInvoice.debours).filter(v => v > 0).length : 0)) % 2 === 0 
                        ? 'bg-gray-50' 
                        : 'bg-white'
                      }`}>
                        <td className="border border-gray-200 p-3">Honoraires - {key}</td>
                        <td className="border border-gray-200 p-3 text-center">1</td>
                        <td className="border border-gray-200 p-3 text-right font-medium">{formatCurrency(value)}</td>
                        <td className="border border-gray-200 p-3 text-right font-medium">{formatCurrency(value)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-6">
              <div className="w-1/3">
                <table className="w-full text-sm border-collapse shadow-md border-2 border-gray-100 rounded-md overflow-hidden">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-medium bg-gray-50">Total HT:</td>
                      <td className="p-3 text-right bg-white font-medium">{formatCurrency(Math.round(previewInvoice.totalTTC / 1.18))} FCFA</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-medium bg-gray-50">TVA (18%):</td>
                      <td className="p-3 text-right bg-white font-medium">{formatCurrency(Math.round(previewInvoice.totalTTC - (previewInvoice.totalTTC / 1.18)))} FCFA</td>
                    </tr>
                    <tr className="bg-green-700 text-white font-bold">
                      <td className="p-3">Total TTC:</td>
                      <td className="p-3 text-right">{formatCurrency(previewInvoice.totalTTC)} FCFA</td>
                    </tr>
                    {previewInvoice.payment?.provision && previewInvoice.payment?.provisionAmount > 0 && (
                      <tr className="bg-green-50 border-b border-gray-200">
                        <td className="p-3 font-medium">Provision versée:</td>
                        <td className="p-3 text-right text-green-600 font-medium">{formatCurrency(previewInvoice.payment.provisionAmount)} FCFA</td>
                      </tr>
                    )}
                    {previewInvoice.payment?.provision && previewInvoice.payment?.provisionAmount > 0 && previewInvoice.payment?.provisionAmount < previewInvoice.totalTTC && (
                      <tr className="bg-red-50 font-bold">
                        <td className="p-3">Reste à payer:</td>
                        <td className="p-3 text-right text-red-600">{formatCurrency(previewInvoice.totalTTC - previewInvoice.payment.provisionAmount)} FCFA</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Arrêté de facture */}
            <div className="mb-8 border-t-2 border-green-100 pt-4 mt-6">
              <p className="font-medium text-green-800">
                Arrêté la présente facture à la somme de: <span className="font-bold">{formatCurrency(previewInvoice.totalTTC)} FCFA</span>
                <span className="block mt-1 text-sm text-gray-600 italic">(Somme en lettres: {previewInvoice.amountInWords || 'Non disponible'})</span>
              </p>
            </div>

            {/* Pied de page */}
            <div className="mt-12 mb-8">
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-700 w-1/2">
                  <p className="font-medium text-green-800">Informations bancaires:</p>
                  <p className="mb-1">Banque: CORIS BANK BURKINA FASO</p>
                  <p className="mb-1">IBAN: BF000 0000 0000 0000 0000 0000</p>
                  <p className="mb-1">SWIFT: CORIBFBFXXX</p>
                  <p className="mt-4">Conditions de paiement: paiement à réception de la facture.</p>
                </div>
                <div className="w-1/3 text-center">
                  <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-50 mb-2">
                    <div className="border-b border-gray-400 pb-16 mb-2">
                      {/* Espace pour la signature */}
                    </div>
                    <p className="text-sm font-medium text-green-800">Signature et cachet</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-green-700">
                <div className="text-center text-sm">
                  <p className="font-medium text-green-800">Merci pour votre confiance</p>
                  <p className="text-gray-600 mt-2">Pour toute question concernant cette facture, veuillez nous contacter au +226 XX XX XX XX</p>
                </div>
                <div className="flex justify-center mt-4">
                  <div className="h-1 w-16 bg-red-600 mx-1"></div>
                  <div className="h-1 w-16 bg-green-700 mx-1"></div>
                  <div className="h-1 w-16 bg-yellow-400 mx-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BillingManager.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    function: PropTypes.string,
    role: PropTypes.string
  })
};

export default BillingManager;
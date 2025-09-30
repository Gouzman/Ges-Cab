import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Receipt, Printer, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import InvoiceForm from '@/components/InvoiceForm';

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

  const handleAddInvoice = async (_invoiceData) => {
    toast({
      variant: "destructive",
      title: "Fonctionnalité non disponible",
      description: "La création de factures nécessite l'intégration de Supabase. Veuillez compléter l'intégration.",
    });
    setShowForm(false);
  };

  const handleEditInvoice = async (_invoiceData) => {
     toast({
      variant: "destructive",
      title: "Fonctionnalité non disponible",
      description: "La modification de factures nécessite l'intégration de Supabase. Veuillez compléter l'intégration.",
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleDeleteInvoice = async (_invoiceId) => {
    toast({
      variant: "destructive",
      title: "Fonctionnalité non disponible",
      description: "La suppression de factures nécessite l'intégration de Supabase. Veuillez compléter l'intégration.",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Impression en cours...",
      description: "Préparation de la facture pour l'impression.",
    });
    window.print();
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion de la Facturation</h1>
          <p className="text-slate-400">Créez et suivez vos factures et honoraires.</p>
        </div>
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
                <Button variant="ghost" size="icon" onClick={() => {
                  toast({
                    title: "🚧 Fonctionnalité non implémentée",
                    description: "L'impression individuelle sera bientôt disponible.",
                  });
                }}>
                  <Printer className="w-4 h-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}>
                  <Edit className="w-4 h-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
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
          onCancel={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onPrint={handlePrint}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

import PropTypes from 'prop-types';

BillingManager.propTypes = {
  currentUser: PropTypes.object,
};

export default BillingManager;
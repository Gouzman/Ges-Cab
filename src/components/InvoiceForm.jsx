import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, User, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { numberToWords } from '@/lib/numberToWords';

const formatCurrency = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
};

const parseCurrency = (value) => {
  if (typeof value !== 'string') return 0;
  const number = Number(value.replace(/\s/g, '').replace(/[^0-9]/g, ""));
  return isNaN(number) ? 0 : number;
};

const InvoiceForm = ({ invoice, onSubmit, onCancel, onPrint }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    caseId: '',
    debours: {
      entrevue: 0,
      dossier: 0,
      plaidoirie: 0,
      huissier: 0,
      deplacement: 0,
    },
    honoraires: {
      forfait: 0,
      tauxHoraire: 0,
      base: 0,
      resultat: 0,
    },
    payment: {
      method: 'virement',
      provision: false,
      provisionAmount: 0,
    },
  });

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
  }, [invoice]);

  const handleInputChange = (section, name, value) => {
    const parsedValue = parseCurrency(value);
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [name]: parsedValue }
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    const isProvisionRadio = name === 'provision';

    setFormData(prev => {
        let newPaymentState = { ...prev.payment };

        if (isProvisionRadio) {
            newPaymentState.provision = value === 'true';
        } else if (name === 'provisionAmount') {
            newPaymentState[name] = parseCurrency(value);
        } else {
            newPaymentState[name] = value;
        }
        
        return { ...prev, payment: newPaymentState };
    });
  };

  const { totalDebours, totalHonoraires, totalHT, tva, totalTTC, resteAPayer } = useMemo(() => {
    const totalDebours = Object.values(formData.debours).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const totalHonoraires = Object.values(formData.honoraires).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const totalHT = totalDebours + totalHonoraires;
    const tva = totalHT * 0.18;
    const totalTTC = totalHT + tva;
    const resteAPayer = formData.payment.provision ? totalTTC - (Number(formData.payment.provisionAmount) || 0) : totalTTC;
    return { totalDebours, totalHonoraires, totalHT, tva, totalTTC, resteAPayer };
  }, [formData.debours, formData.honoraires, formData.payment.provision, formData.payment.provisionAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Inclure tous les totaux calculés dans les données soumises
    const completeFormData = {
      ...formData,
      totalDebours,
      totalHonoraires,
      totalHT,
      tva,
      totalTTC,
      resteAPayer
    };
    
    onSubmit(completeFormData);
  };

  const renderCurrencyInput = (label, name, value, onChange) => (
    <div className="flex items-center justify-between">
      <label className="text-slate-300 flex items-center print:text-black">
        <input type="checkbox" className="mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 print:hidden" />
        {label}
      </label>
      <div className="relative w-48">
        <input
          type="text"
          name={name}
          value={formatCurrency(value)}
          onChange={onChange}
          className="w-full pl-3 pr-14 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-right placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 print:bg-white print:text-black print:border-gray-300"
          placeholder="0"
        />
        <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm print:text-gray-500">F CFA</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto print:bg-white print:border-none print:shadow-none print:max-h-full print:overflow-visible"
      >
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h2 className="text-2xl font-bold text-white">
            Honoraires et Conditions d'Intervention
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 print:text-black"><User className="w-4 h-4 inline mr-2" />Client</label>
              <input type="text" name="clientName" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white print:bg-white print:text-black print:border-gray-300" placeholder="Nom du client" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 print:text-black"><FileText className="w-4 h-4 inline mr-2" />Dossier</label>
              <input type="text" name="caseId" value={formData.caseId} onChange={(e) => setFormData({...formData, caseId: e.target.value})} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white print:bg-white print:text-black print:border-gray-300" placeholder="ID du dossier associé" />
            </div>
          </div>

          <div className="space-y-4 p-4 border border-slate-700 rounded-lg print:border-gray-300">
            <h3 className="text-lg font-semibold text-indigo-400 print:text-indigo-600">Débours</h3>
            {renderCurrencyInput("Frais d'entrevue", "entrevue", formData.debours.entrevue, (e) => handleInputChange('debours', 'entrevue', e.target.value))}
            {renderCurrencyInput("Frais de dossier", "dossier", formData.debours.dossier, (e) => handleInputChange('debours', 'dossier', e.target.value))}
            {renderCurrencyInput("Frais de timbre de plaidoirie", "plaidoirie", formData.debours.plaidoirie, (e) => handleInputChange('debours', 'plaidoirie', e.target.value))}
            {renderCurrencyInput("Frais d'actes d'Huissier", "huissier", formData.debours.huissier, (e) => handleInputChange('debours', 'huissier', e.target.value))}
            {renderCurrencyInput("Frais de déplacement, de séjour et de vacation", "deplacement", formData.debours.deplacement, (e) => handleInputChange('debours', 'deplacement', e.target.value))}
          </div>

          <div className="space-y-4 p-4 border border-slate-700 rounded-lg print:border-gray-300">
            <h3 className="text-lg font-semibold text-purple-400 print:text-purple-600">Honoraires</h3>
            {renderCurrencyInput("Forfait", "forfait", formData.honoraires.forfait, (e) => handleInputChange('honoraires', 'forfait', e.target.value))}
            {renderCurrencyInput("Taux horaire", "tauxHoraire", formData.honoraires.tauxHoraire, (e) => handleInputChange('honoraires', 'tauxHoraire', e.target.value))}
            {renderCurrencyInput("Honoraires de base", "base", formData.honoraires.base, (e) => handleInputChange('honoraires', 'base', e.target.value))}
            {renderCurrencyInput("Honoraires de résultat", "resultat", formData.honoraires.resultat, (e) => handleInputChange('honoraires', 'resultat', e.target.value))}
          </div>

          <div className="space-y-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg print:bg-gray-100 print:border-gray-300">
            <h3 className="text-lg font-semibold text-white mb-4 print:text-black">Total</h3>
            <div className="flex justify-between text-slate-300 print:text-black"><p>Montant HT dû</p><p>{formatCurrency(totalHT)} F CFA</p></div>
            <div className="flex justify-between text-slate-300 print:text-black"><p>Montant TVA (18%)</p><p>{formatCurrency(tva)} F CFA</p></div>
            <div className="border-t border-slate-600 my-2 print:border-gray-300"></div>
            <div className="flex justify-between text-white font-bold text-lg print:text-black"><p>Total TTC</p><p>{formatCurrency(totalTTC)} F CFA</p></div>
            <p className="text-sm text-slate-400 italic capitalize print:text-gray-600">{numberToWords(totalTTC)} francs CFA</p>
          </div>

          <div className="space-y-4 p-4 border border-slate-700 rounded-lg print:border-gray-300">
            <h3 className="text-lg font-semibold text-green-400 print:text-green-600">Paiement</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 print:text-black">Mode de paiement envisagé</label>
              <div className="flex flex-wrap gap-4">
                {['Virement', 'Chèque', 'Carte bancaire', 'Espèces', 'Autre'].map(method => (
                  <label key={method} className="flex items-center text-slate-300 print:text-black">
                    <input type="radio" name="method" value={method.toLowerCase().replace(' ', '')} checked={formData.payment.method === method.toLowerCase().replace(' ', '')} onChange={handlePaymentChange} className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 print:hidden" />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 print:text-black">Dépôt de provision / Avance sur frais demandé(e)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center text-slate-300 print:text-black">
                  <input type="radio" name="provision" value="true" checked={formData.payment.provision === true} onChange={handlePaymentChange} className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 print:hidden" />
                  Oui
                </label>
                <label className="flex items-center text-slate-300 print:text-black">
                  <input type="radio" name="provision" value="false" checked={formData.payment.provision === false} onChange={handlePaymentChange} className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 print:hidden" />
                  Non
                </label>
                {formData.payment.provision && (
                  <div className="relative flex-1">
                    <input type="text" name="provisionAmount" value={formatCurrency(formData.payment.provisionAmount)} onChange={handlePaymentChange} className="w-full pl-3 pr-14 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-right print:bg-white print:text-black print:border-gray-300" placeholder="Montant" />
                     <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm print:text-gray-500">F CFA</span>
                  </div>
                )}
              </div>
            </div>
            {formData.payment.provision && (
              <div className="mt-4 pt-4 border-t border-slate-700 print:border-gray-300">
                <div className="flex justify-between text-green-400 font-bold text-lg print:text-green-600">
                  <p>Reste à payer</p>
                  <p>{formatCurrency(resteAPayer)} F CFA</p>
                </div>
                <p className="text-sm text-slate-400 italic capitalize print:text-gray-600">{numberToWords(resteAPayer)} francs CFA</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 print:hidden">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              {invoice ? 'Mettre à jour' : 'Créer la Facture'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
              Annuler
            </Button>
            <Button type="button" variant="outline" onClick={onPrint} className="border-blue-500 text-blue-400 hover:bg-blue-500/20">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceForm;
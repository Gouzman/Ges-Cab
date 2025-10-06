import { numberToWords } from './numberToWords';

export const generateInvoicePDF = (invoice) => {
  // Validation de l'objet invoice
  if (!invoice || !invoice.invoiceNumber) {
    console.error('Données de facture invalides:', invoice);
    throw new Error('Les données de la facture sont invalides ou manquantes');
  }

  // Pour l'instant, utiliser l'impression système
  // Plus tard, on pourra intégrer jsPDF pour une génération PDF personnalisée
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
  }

  const formatCurrency = (value) => {
    if (isNaN(value) || value === null) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facture ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 20px;
        }
        
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          margin: 0;
        }
        
        .invoice-number {
          font-size: 18px;
          color: #666;
          margin: 10px 0;
        }
        
        .client-info {
          margin-bottom: 30px;
        }
        
        .client-info h3 {
          color: #4f46e5;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        .details-section {
          margin-bottom: 25px;
        }
        
        .details-section h4 {
          background: #f8fafc;
          padding: 10px;
          margin: 0 0 10px 0;
          border-left: 4px solid #4f46e5;
          color: #4f46e5;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .totals-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
        }
        
        .total-final {
          font-size: 20px;
          font-weight: bold;
          color: #4f46e5;
          border-top: 2px solid #4f46e5;
          padding-top: 15px;
          margin-top: 15px;
        }
        
        .total-words {
          font-style: italic;
          color: #666;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .payment-section {
          margin-top: 30px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 8px;
        }
        
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <h1 class="invoice-title">Honoraires et Conditions d'Intervention</h1>
        <p class="invoice-number">Facture N° ${invoice.invoiceNumber}</p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="client-info">
        <h3>Client</h3>
        <p><strong>${invoice.clientName}</strong></p>
        ${invoice.caseId ? `<p>Dossier: ${invoice.caseId}</p>` : ''}
      </div>

      <div class="details-section">
        <h4>Débours</h4>
        <div class="details-grid">
          <div class="detail-item">
            <span>Frais d'entrevue:</span>
            <span>${formatCurrency(invoice.debours?.entrevue || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Frais de dossier:</span>
            <span>${formatCurrency(invoice.debours?.dossier || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Frais de timbre de plaidoirie:</span>
            <span>${formatCurrency(invoice.debours?.plaidoirie || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Frais d'actes d'Huissier:</span>
            <span>${formatCurrency(invoice.debours?.huissier || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Frais de déplacement, de séjour et de vacation:</span>
            <span>${formatCurrency(invoice.debours?.deplacement || 0)} F CFA</span>
          </div>
        </div>
      </div>

      <div class="details-section">
        <h4>Honoraires</h4>
        <div class="details-grid">
          <div class="detail-item">
            <span>Forfait:</span>
            <span>${formatCurrency(invoice.honoraires?.forfait || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Taux horaire:</span>
            <span>${formatCurrency(invoice.honoraires?.tauxHoraire || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Honoraires de base:</span>
            <span>${formatCurrency(invoice.honoraires?.base || 0)} F CFA</span>
          </div>
          <div class="detail-item">
            <span>Honoraires de résultat:</span>
            <span>${formatCurrency(invoice.honoraires?.resultat || 0)} F CFA</span>
          </div>
        </div>
      </div>

      <div class="totals-section">
        <div class="total-line">
          <span>Montant HT dû:</span>
          <span>${formatCurrency(invoice.totalHT || 0)} F CFA</span>
        </div>
        <div class="total-line">
          <span>Montant TVA (18%):</span>
          <span>${formatCurrency(invoice.tva || 0)} F CFA</span>
        </div>
        <div class="total-line total-final">
          <span>Total TTC:</span>
          <span>${formatCurrency(invoice.totalTTC || 0)} F CFA</span>
        </div>
        <div class="total-words">
          ${numberToWords(invoice.totalTTC || 0)} francs CFA
        </div>
      </div>

      <div class="payment-section">
        <h4>Paiement</h4>
        <p><strong>Mode de paiement envisagé:</strong> ${invoice.payment?.method || 'Non spécifié'}</p>
        ${invoice.payment?.provision ? `
          <p><strong>Provision versée:</strong> ${formatCurrency(invoice.payment.provisionAmount)} F CFA</p>
          <p><strong>Reste à payer:</strong> ${formatCurrency(invoice.resteAPayer || invoice.totalTTC)} F CFA</p>
        ` : ''}
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
// Service d'export pour CSV et PDF
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class ExportService {
  
  /**
   * Exporte des données en format CSV
   */
  static exportToCSV(data, filename = 'export.csv') {
    try {
      let csvData;
      
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Format tableau 2D
        const [headers, ...rows] = data;
        const csvObjects = rows.map(row => 
          headers.reduce((obj, header, index) => {
            obj[header] = row[index] || '';
            return obj;
          }, {})
        );
        csvData = Papa.unparse(csvObjects);
      } else if (Array.isArray(data)) {
        // Format tableau d'objets
        csvData = Papa.unparse(data);
      } else {
        throw new Error('Format de données non supporté pour CSV');
      }

      const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      return { success: true, filename };
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exporte des données en format PDF
   */
  static exportToPDF(data, title = 'Rapport', filename = 'rapport.pdf') {
    try {
      const doc = new jsPDF();
      
      // Configuration de la police et des styles
      doc.setFont('helvetica');
      
      // En-tête avec titre
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 20, 30);
      
      // Date de génération
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      doc.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 20, 40);
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 45, 190, 45);
      
      // Préparation des données pour le tableau
      let tableData;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Format tableau 2D
        const [headers, ...rows] = data;
        tableData = {
          head: [headers],
          body: rows
        };
      } else if (Array.isArray(data)) {
        // Format tableau d'objets - prendre les clés du premier objet comme en-têtes
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header] || ''));
        tableData = {
          head: [headers],
          body: rows
        };
      } else {
        throw new Error('Format de données non supporté pour PDF');
      }
      
      // Configuration du tableau
      doc.autoTable({
        head: tableData.head,
        body: tableData.body,
        startY: 55,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [40, 40, 40],
          fillColor: [250, 250, 250]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        columnStyles: {
          // Style pour les colonnes numériques
          0: { halign: 'left' }
        }
      });
      
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} sur ${pageCount}`, 190, 285, { align: 'right' });
        doc.text('Ges-Cab - Gestion de Cabinet', 20, 285);
      }
      
      // Sauvegarde
      doc.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export automatique selon le format demandé
   */
  static export(data, format, title = 'Rapport', baseFilename = 'rapport') {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(data, `${baseFilename}_${timestamp}.csv`);
      
      case 'pdf':
        return this.exportToPDF(data, title, `${baseFilename}_${timestamp}.pdf`);
      
      default:
        return { success: false, error: 'Format non supporté. Utilisez "csv" ou "pdf".' };
    }
  }

  /**
   * Formate les données statistiques pour l'export
   */
  static formatStatisticsForExport(statistics, reportType = 'overview') {
    const { tasks, cases, activities, summary, period, dateRange } = statistics;
    
    switch (reportType) {
      case 'tasks':
        return {
          title: `Rapport des Tâches${period ? ` - ${period}` : ''}`,
          data: [
            ['Métrique', 'Valeur'],
            ['Période', dateRange ? `${dateRange.start} → ${dateRange.end}` : 'Toutes les données'],
            ['Total des tâches', tasks.total],
            ['Tâches en attente', tasks.byStatus.pending || 0],
            ['Tâches vues', tasks.byStatus.seen || 0],
            ['Tâches en cours', tasks.byStatus['in-progress'] || 0],
            ['Tâches terminées', tasks.byStatus.completed || 0],
            ['Taux de completion (%)', `${tasks.completionRate}%`],
            ['Tâches en retard', tasks.overdueCount],
            ['', ''], // Ligne vide
            ['Répartition par priorité', ''],
            ['Priorité faible', tasks.byPriority.low || 0],
            ['Priorité moyenne', tasks.byPriority.medium || 0],
            ['Priorité élevée', tasks.byPriority.high || 0],
            ['Priorité urgente', tasks.byPriority.urgent || 0]
          ]
        };

      case 'cases':
        return {
          title: `Rapport des Dossiers${period ? ` - ${period}` : ''}`,
          data: [
            ['Métrique', 'Valeur'],
            ['Période', dateRange ? `${dateRange.start} → ${dateRange.end}` : 'Toutes les données'],
            ['Total des dossiers', cases.total],
            ['Dossiers actifs', cases.active],
            ['Dossiers fermés', cases.closed],
            ['', ''], // Ligne vide
            ['Répartition par statut', ''],
            ...Object.entries(cases.byStatus).map(([status, count]) => [
              `Statut: ${status}`, count
            ])
          ]
        };

      case 'activity':
        return {
          title: `Rapport d'Activité${period ? ` - ${period}` : ''}`,
          data: [
            ['Utilisateur', 'Fonction', 'Total Activités', 'Tâches Créées', 'Tâches Terminées', 'Score (%)', 'Dossiers Créés'],
            ...activities.userStats.map(user => [
              user.userName,
              user.userFunction,
              user.totalActivities,
              user.tasksCreated,
              user.tasksCompleted,
              `${user.productivityScore}%`,
              user.casesCreated || 0
            ])
          ]
        };

      case 'summary':
        return {
          title: `Synthèse Globale${period ? ` - ${period}` : ''}`,
          data: [
            ['Indicateur', 'Valeur', 'Détails'],
            ['Période d\'analyse', dateRange ? `${dateRange.start} → ${dateRange.end}` : 'Toutes les données', ''],
            ['', '', ''], // Ligne vide
            ['📊 TÂCHES', '', ''],
            ['Total des tâches', summary.totalTasks, `${tasks.completionRate}% terminées`],
            ['Tâches en retard', tasks.overdueCount, `${((tasks.overdueCount / tasks.total) * 100).toFixed(1)}% du total`],
            ['Tâche priorité urgente', tasks.byPriority.urgent || 0, ''],
            ['', '', ''], // Ligne vide
            ['📁 DOSSIERS', '', ''],
            ['Total des dossiers', summary.totalCases, ''],
            ['Dossiers actifs', cases.active, `${((cases.active / cases.total) * 100).toFixed(1)}% du total`],
            ['Dossiers fermés', cases.closed, `${((cases.closed / cases.total) * 100).toFixed(1)}% du total`],
            ['', '', ''], // Ligne vide
            ['👥 ACTIVITÉ ÉQUIPE', '', ''],
            ['Utilisateurs actifs', summary.activeUsers, ''],
            ['Total activités', summary.totalActivities, ''],
            ['Utilisateur le plus actif', activities.mostActiveUser?.userName || 'N/A', 
             `${activities.mostActiveUser?.totalActivities || 0} activités`]
          ]
        };

      case 'overview':
      default:
        return {
          title: `Vue d'Ensemble${period ? ` - ${period}` : ''}`,
          data: [
            ['Métrique', 'Valeur'],
            ['Période', dateRange ? `${dateRange.start} → ${dateRange.end}` : 'Toutes les données'],
            ['Total des tâches', summary.totalTasks],
            ['Total des dossiers', summary.totalCases],
            ['Total des activités', summary.totalActivities],
            ['Utilisateurs actifs', summary.activeUsers],
            ['Taux de completion (%)', `${summary.completionRate}%`],
            ['Tâches en retard', tasks.overdueCount]
          ]
        };
    }
  }

  /**
   * Export rapide avec formatage automatique
   */
  static quickExport(statistics, reportType, format) {
    const formattedData = this.formatStatisticsForExport(statistics, reportType);
    const baseFilename = `rapport_${reportType}_${statistics.period || 'complet'}`;
    
    return this.export(formattedData.data, format, formattedData.title, baseFilename);
  }
}

export default ExportService;
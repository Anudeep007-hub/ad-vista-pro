import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { CampaignData } from './mockData';

export class ExportService {
  static async exportToPDF(elementId: string, filename: string = 'dashboard-report.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  static exportToCSV(data: CampaignData[], filename: string = 'campaign-data.csv'): void {
    try {
      const csv = Papa.unparse(data, {
        header: true,
        columns: [
          'id', 'name', 'client', 'budget', 'spent', 
          'impressions', 'clicks', 'conversions', 'ctr', 'cpc', 
          'status', 'startDate', 'endDate'
        ]
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  static exportMetricsToCSV(metrics: any, filename: string = 'metrics-report.csv'): void {
    try {
      const data = Object.entries(metrics).map(([key, value]: [string, any]) => ({
        metric: key.charAt(0).toUpperCase() + key.slice(1),
        value: value.value,
        change: `${value.change > 0 ? '+' : ''}${value.change.toFixed(2)}%`,
        trend: value.trend
      }));

      const csv = Papa.unparse(data, { header: true });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting metrics to CSV:', error);
      throw error;
    }
  }
}
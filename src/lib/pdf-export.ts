import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ExportOptions } from '@/types';

export async function exportToPDF(
  element: HTMLElement,
  filename: string,
  options: ExportOptions = {
    format: 'pdf',
    includeImages: true,
    paperSize: 'A4',
    orientation: 'portrait',
    includeMetadata: true,
  }
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = options.paperSize === 'A4' ? 210 : 215.9;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize.toLowerCase(),
    });

    const pageHeight = options.paperSize === 'A4' ? 297 : 279.4;
    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (options.includeMetadata) {
      pdf.setProperties({
        title: filename,
        subject: 'Interactive Utilities Suite Export',
        author: 'Educational Platform',
        keywords: 'design, education, case-study',
        creator: 'Interactive Utilities Suite',
      });
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

export async function exportToText(content: string, filename: string): Promise<void> {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function preparePrintLayout(element: HTMLElement): void {
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #print-content, #print-content * {
        visibility: visible;
      }
      #print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      @page {
        size: A4;
        margin: 20mm;
      }
      * {
        font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
  
  element.id = 'print-content';
  window.print();
}

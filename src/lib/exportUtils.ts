import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  title: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string }[];
}

/**
 * Generates and downloads a PDF report of the calculation results
 */
export const downloadAsPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237); // Primary purple color
  doc.text('CalHub', 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(data.title, 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${timestamp}`, 14, 38);

  // Inputs Table
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Input Parameters', 14, 50);
  
  autoTable(doc, {
    startY: 55,
    head: [['Parameter', 'Value']],
    body: data.inputs.map(i => [i.label, i.value]),
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] }
  });

  // Results Table
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  doc.text('Calculation Results', 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Result', 'Value']],
    body: data.results.map(r => [r.label, r.value]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] } // Success green color
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for using CalHub - Your Smart Calculation Hub', 14, 285);
  }

  doc.save(`CalHub_${data.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};

/**
 * Formats the calculation data into a plain text string
 */
export const formatResultText = (data: ExportData): string => {
  let text = `*CalHub Result: ${data.title}*\n\n`;
  text += `--- Inputs ---\n`;
  data.inputs.forEach(i => {
    text += `${i.label}: ${i.value}\n`;
  });
  text += `\n--- Results ---\n`;
  data.results.forEach(r => {
    text += `${r.label}: ${r.value}\n`;
  });
  text += `\nGenerated on: ${new Date().toLocaleString()}\n`;
  text += `Try it at: ${window.location.origin}`;
  return text;
};

/**
 * Shares the result via WhatsApp
 */
export const shareToWhatsApp = (data: ExportData) => {
  const text = formatResultText(data);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

/**
 * Copies the result text to clipboard
 */
export const copyToClipboard = async (data: ExportData): Promise<boolean> => {
  const text = formatResultText(data);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

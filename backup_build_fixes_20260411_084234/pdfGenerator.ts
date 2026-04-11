import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DocumentTemplate {
  title: string;
  subtitle?: string;
  header?: string[];
  content: Record<string, any>;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export class PDFGenerator {
  static async generateProcessDocument(processo: any, templateType: string = 'termo'): Promise<Blob> {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`PROCESSO Nº ${processo.numero}`, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(processo.titulo, 105, 30, { align: 'center' });
    
    doc.line(20, 38, 190, 38);
    
    // Dados do processo
    autoTable(doc, {
      startY: 45,
      head: [['Campo', 'Valor']],
      body: [
        ['Número', processo.numero],
        ['Título', processo.titulo],
        ['Status', processo.status],
        ['Data Criação', new Date(processo.created_at).toLocaleDateString('pt-BR')],
        ['Árbitro Responsável', processo.arbitro?.nome || 'Não atribuído'],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Gerado automaticamente pelo InovaSys | ' + new Date().toLocaleString('pt-BR'), 105, 285, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    }
    
    return doc.output('blob');
  }

  static async generateConsolidatedReport(processos: any[]): Promise<Blob> {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('RELATÓRIO CONSOLIDADO DE PROCESSOS', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total de ${processos.length} processos selecionados`, 105, 30, { align: 'center' });
    
    const tableData = processos.map((p, idx) => [
      idx + 1,
      p.numero,
      p.titulo.substring(0, 40) + (p.titulo.length > 40 ? '...' : ''),
      p.status,
      new Date(p.created_at).toLocaleDateString('pt-BR')
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['#', 'Número', 'Título', 'Status', 'Criação']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
      },
    });
    
    return doc.output('blob');
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
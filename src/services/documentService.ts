import html2pdf from 'html2pdf.js';
import { templateService } from './templateService';

export const documentService = {
  /**
   * Compila o HTML do template substituindo os placeholders pelos dados fornecidos.
   */
  compileHTML: async (tipoDocumento: number, placeholders: Record<string, string>): Promise<string> => {
    const template = await templateService.getByType(tipoDocumento);
    if (!template) {
      throw new Error(`Template do tipo ${tipoDocumento} não encontrado.`);
    }

    let html = template.conteudo_html;
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{${key}}`, 'g');
      
      // 📝 Tratamento para Editor Amigável (Preservar quebras e caracteres especiais)
      // Se o valor não contém tags HTML, tratamos como texto puro convertendo quebras
      const safeValue = (value || '');
      const formattedValue = !/<[a-z][\s\S]*>/i.test(safeValue) 
        ? safeValue.replace(/\n/g, '<br />') 
        : safeValue;

      html = html.replace(regex, formattedValue);
    }

    return `
      <div class="document-container" style="font-family: Arial, sans-serif; font-size: 14pt; line-height: 1.5; color: #000;">
        ${html}
      </div>
    `;
  },

  /**
   * Gera o PDF a partir de um HTML bruto.
   */
  downloadPDF: async (html: string, filename: string): Promise<void> => {
    const opt = {
      margin: 0.75,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    const element = document.createElement('div');
    element.innerHTML = html;
    await html2pdf().set(opt).from(element).save();
  },

  /**
   * Gera e baixa um documento PDF a partir de um template e placeholders.
   */
  generateFromTemplate: async (tipoDocumento: number, placeholders: Record<string, string>, filename: string): Promise<void> => {
    const html = await documentService.compileHTML(tipoDocumento, placeholders);
    await documentService.downloadPDF(html, filename);
  }
};

export default documentService;

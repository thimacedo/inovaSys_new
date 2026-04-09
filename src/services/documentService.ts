import html2pdf from 'html2pdf.js';
import { templateService } from './templateService';

export const documentService = {
  /**
   * Busca um template por tipo, substitui as variáveis pelo dicionário de dados e força o download do PDF.
   */
  generateFromTemplate: async (tipoDocumento: number, placeholders: Record<string, string>, filename: string): Promise<void> => {
    try {
      const template = await templateService.getByType(tipoDocumento);
      
      if (!template) {
        throw new Error(`Template do tipo ${tipoDocumento} não encontrado no banco de dados.`);
      }

      let html = template.conteudo_html;
      
      // Interpolação de variáveis: substitui {chave} pelo valor correspondente
      for (const [key, value] of Object.entries(placeholders)) {
        const regex = new RegExp(`{${key}}`, 'g');
        html = html.replace(regex, value || '');
      }

      // Estilo injetado para garantir formatação A4 padrão e margens
      const htmlWrapper = `
        <div style="font-family: Arial, sans-serif; font-size: 14pt; line-height: 1.5; color: #000;">
          ${html}
        </div>
      `;

      const opt = {
        margin:       0.75, // polegadas (aprox 2cm)
        filename:     `${filename}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      const element = document.createElement('div');
      element.innerHTML = htmlWrapper;
      
      await html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error('[DocumentService] Erro ao gerar PDF:', error);
      throw error;
    }
  }
};

export default documentService;

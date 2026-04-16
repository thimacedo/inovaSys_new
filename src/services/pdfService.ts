import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker necessária para o pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Serviço especializado na extração de texto de documentos PDF nativos.
 * Atua de forma neutra, fornecendo apenas o conteúdo bruto para processamento mecânico.
 */
export const pdfService = {
  /**
   * Extrai o conteúdo textual de um arquivo PDF.
   * 
   * Args:
   *   url (string): A URL do arquivo PDF (ou Blob URL).
   * 
   * Returns:
   *   Promise<string>: O texto completo extraído do documento.
   * 
   * Raises:
   *   Error: Se houver falha ao carregar ou processar o PDF.
   */
  extractText: async (url: string): Promise<string> => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('[PDFService] Erro ao extrair texto do PDF:', error);
      throw new Error('Falha técnica na leitura do arquivo PDF nativo.');
    }
  },

  /**
   * Verifica se o arquivo é um PDF para direcionamento correto do motor de extração.
   * 
   * Args:
   *   fileName (string): O nome do arquivo com extensão.
   * 
   * Returns:
   *   boolean: Verdadeiro se for um arquivo PDF.
   */
  isPDF: (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  }
};

export default pdfService;

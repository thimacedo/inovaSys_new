import { createWorker } from 'tesseract.js';

export const ocrService = {
  /**
   * Extrai texto de uma imagem (URL ou Blob).
   */
  extractText: async (imageSource: string | Blob): Promise<string> => {
    try {
      const worker = await createWorker('por'); // Idioma Português
      const { data: { text } } = await worker.recognize(imageSource);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('[OCRService] Erro ao extrair texto:', error);
      throw new Error('Falha no processamento OCR da imagem.');
    }
  },

  /**
   * Identifica se o arquivo é passível de OCR direto.
   */
  isSupported: (fileName: string): boolean => {
    const supported = ['.png', '.jpg', '.jpeg', '.bmp', '.pbm'];
    return supported.some(ext => fileName.toLowerCase().endsWith(ext));
  }
};

export default ocrService;

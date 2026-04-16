import { describe, it, expect, vi } from 'vitest';
import { pdfService } from './pdfService';

// Mock do pdfjs-dist para evitar carregamento real nos testes
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn(() => Promise.resolve({
        getTextContent: vi.fn(() => Promise.resolve({
          items: [{ str: 'Texto de teste do PDF' }]
        }))
      }))
    })
  })),
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  version: '1.0.0'
}));

describe('pdfService', () => {
  it('deve identificar corretamente um arquivo PDF', () => {
    expect(pdfService.isPDF('documento.pdf')).toBe(true);
    expect(pdfService.isPDF('DOCUMENTO.PDF')).toBe(true);
    expect(pdfService.isPDF('imagem.jpg')).toBe(false);
  });

  it('deve extrair texto de um PDF mockado', async () => {
    const text = await pdfService.extractText('blob:url-mock');
    expect(text).toContain('Texto de teste do PDF');
  });
});

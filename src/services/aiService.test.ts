import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from './aiService';

// Mock do módulo @google/generative-ai
vi.mock('@google/generative-ai', () => {
  const generateContentMock = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Texto gerado pela IA'
    }
  });

  const getGenerativeModelMock = vi.fn().mockReturnValue({
    generateContent: generateContentMock
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: getGenerativeModelMock
      };
    })
  };
});

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
  });

  it('suggestClausula deve retornar texto sugerido', async () => {
    const res = await aiService.suggestClausula('contexto', 'prompt');
    expect(res).toBe('Texto gerado pela IA');
  });

  it('generateSentence deve retornar HTML da sentença', async () => {
    const res = await aiService.generateSentence({ id: '1' }, 'diretrizes');
    expect(res).toBe('Texto gerado pela IA');
  });

  it('improveDraft deve retornar texto melhorado', async () => {
    const res = await aiService.improveDraft('rascunho');
    expect(res).toBe('Texto gerado pela IA');
  });

  it('deve retornar erro amigável quando a API Key estiver faltando', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const res = await aiService.suggestClausula('contexto', 'prompt');
    expect(res).toContain('[ERRO IA]');
  });
});

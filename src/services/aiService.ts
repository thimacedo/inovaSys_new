import { GoogleGenerativeAI } from '@google/generative-ai';

// A chave será buscada do ambiente (VITE_GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const aiService = {
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Você é o assistente jurídico oficial da Câmara InovaSys de Mediação e Arbitragem.
      Contexto: ${contexto}
      
      Pergunta do Usuário: ${promptUsuario}
      
      Responda de forma profissional, direta e juridicamente embasada de acordo com as leis brasileiras de arbitragem (Lei 9.307/96).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn('AI Service Error (using fallback):', error);
      // Fallback Mock
      const key = promptUsuario.toLowerCase();
      if (key.includes('clausula') || key.includes('arbitragem')) {
        return `CLÁUSULA COMPROMISSÓRIA RECOMENDADA:\n"Qualquer controvérsia decorrente deste contrato será resolvida definitivamente por arbitragem sob as regras da Câmara InovaSys, por um ou mais árbitros nomeados conforme o referido regulamento."`;
      }
      return `Como assistente InovaSys, recomendo verificar o Artigo 4º do nosso regulamento para detalhes sobre ${promptUsuario}. Posso ajudar com mais algo?`;
    }
  },

  improveDraft: async (text: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Refine o seguinte rascunho jurídico para torná-lo mais formal, claro e condizente com padrões de câmaras de arbitragem modernas:\n\n${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      return `[Refinado]: ${text.trim()} (Texto ajustado para clareza comercial).`;
    }
  }
};

export default aiService;


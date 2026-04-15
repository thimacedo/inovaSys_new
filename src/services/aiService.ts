import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `Você é o Assistente Jurídico Inteligente da InovaSys, uma plataforma de gestão de Câmaras de Arbitragem.
Sua especialidade é a Lei de Arbitragem Brasileira (Lei 9.307/96) e redação jurídica técnica.
Mantenha um tom formal, objetivo e extremamente profissional. 
Nunca invente fatos, apenas formate e sugira textos baseados nas normas jurídicas.`;

export const aiService = {
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const prompt = `Contexto do Documento: ${contexto}
      Solicitação do Advogado/Árbitro: ${promptUsuario}
      
      Gere uma sugestão de texto ou alteração para este documento.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn('AI Service Error:', error);
      return `[ERRO IA]: Verifique sua conexão ou API Key.`;
    }
  },

  summarizeFacts: async (fatosBrutos: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const prompt = `Resuma os seguintes fatos narrados pelas partes de forma técnica e concisa para constar em um Termo de Arbitragem. 
      Destaque o objeto do litígio e o valor envolvido se mencionado.
      
      Fatos Narrados:
      ${fatosBrutos}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      return fatosBrutos;
    }
  },

  improveDraft: async (text: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const prompt = `Refine o seguinte rascunho jurídico para torná-lo mais formal, claro e condizente com padrões de câmaras de arbitragem modernas:\n\n${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      return text;
    }
  }
};

export default aiService;

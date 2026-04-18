import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🤖 AI SERVICE - MULTI-PROVIDER (GEMINI & GROK)
 * Sistema de inteligência de alta performance InovaSys v2.0.
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROK_KEY = import.meta.env.VITE_GROK_API_KEY || ''; 

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const SYSTEM_INSTRUCTION = `Você é um Assistente Administrativo da InovaSys. 
Sua função é formatação textual e correção gramatical mecânica seguindo a Lei 9.307/96.
O Árbitro deve ser referido como Juiz de Fato e de Direito (Art. 18).`;

export const aiService = {
  /**
   * Melhora a clareza e gramática de um texto.
   */
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    try {
      if (GEMINI_KEY) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `${SYSTEM_INSTRUCTION}\n\nContexto: ${contexto}\nFormate o seguinte texto:\n${promptUsuario}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (e) {
      console.warn('[aiService] Gemini falhou, tentando Grok...');
    }

    try {
      if (!GROK_KEY) throw new Error('Grok Key missing');
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROK_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: `Formate o seguinte texto:\n${promptUsuario}` }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return `[ERRO IA]: Falha na conexão com os motores de inteligência.`;
    }
  },

  /**
   * Refina rascunhos corrigindo apenas ortografia e gramática.
   */
  improveDraft: async (text: string) => {
    return aiService.suggestClausula("Revisão Gramatical", text);
  },

  /**
   * Gera minutas de sentenças arbitrais.
   */
  generateSentence: async (processoContext: string, fatos: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const prompt = `Gere uma minuta de sentença baseada no contexto: ${processoContext} e fatos: ${fatos}. Siga a Lei 9.307/96.`;
      const result = await model.generateContent(prompt);
      return result.response.text() + "\n\n---\nDocumento gerado com auxílio de IA. Revisão obrigatória pelo Árbitro.";
    } catch (e) {
      throw new Error('Falha na geração da sentença.');
    }
  },

  /**
   * Extração de dados estruturados.
   */
  extractMechanicalData: async (text: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Extraia nomes, datas e valores deste texto em JSON:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      return null;
    }
  }
};

export default aiService;

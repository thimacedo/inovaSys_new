import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🤖 AI SERVICE - MULTI-PROVIDER (GEMINI & GROK)
 * Sistema de inteligência de contingência para InovaSys v2.0.
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROK_KEY = import.meta.env.VITE_GROK_API_KEY || ''; // Chave de contingência carregada via ENV

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const SYSTEM_INSTRUCTION = `Você é um Assistente Administrativo da InovaSys. 
Sua função é formatação textual e correção gramatical mecânica. 
NUNCA interfira no mérito jurídico ou sugira decisões.`;

export const aiService = {
  /**
   * Tenta gerar conteúdo via Gemini, se falhar, utiliza o Grok (xAI).
   */
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    // 1. Tentativa Primária: Gemini 1.5 Flash
    try {
      if (GEMINI_KEY) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${SYSTEM_INSTRUCTION}\n\nFormate o seguinte texto:\n${promptUsuario}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (geminiError) {
      console.warn('[aiService] Gemini falhou, tentando contingência Grok...', geminiError);
    }

    // 2. Contingência: Grok (xAI) via OpenAI-Compatible API
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROK_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: `Formate o seguinte texto solicitado pelo usuário:\n${promptUsuario}` }
          ]
        })
      });

      if (!response.ok) throw new Error(`xAI Error: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (grokError) {
      console.error('[aiService] Falha total em todos os provedores de IA:', grokError);
      return `[ERRO IA]: Falha na rede ou limite de cota atingido.`;
    }
  },

  /**
   * Extração mecânica utilizando o provedor mais rápido disponível.
   */
  extractMechanicalData: async (text: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extraia apenas os dados mecânicos (Nomes, CPFs, Valores) deste texto em formato JSON:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const respText = result.response.text();
      const jsonMatch = respText.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('[aiService] Falha na extração de dados:', e);
      return null;
    }
  }
};

export default aiService;

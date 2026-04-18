import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🤖 AI SERVICE - MULTI-PROVIDER RESILIENTE (GEMINI & GROK)
 * Sistema de inteligência InovaSys v2.1 - Foco em Alta Disponibilidade.
 */

// Chaves de API via variáveis de ambiente Vite
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROK_KEY = import.meta.env.VITE_GROK_API_KEY || ''; 

// Inicialização segura do SDK Google
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

const SYSTEM_INSTRUCTION = `Você é um Assistente Administrativo da InovaSys. 
Sua função é formatação textual e correção gramatical mecânica seguindo a Lei 9.307/96.
O Árbitro deve ser referido como Juiz de Fato e de Direito (Art. 18).`;

/**
 * Helper interno para chamadas ao Gemini com log de auditoria.
 */
async function tryGemini(prompt: string, modelName: string = "gemini-1.5-flash"): Promise<string> {
  if (!genAI) throw new Error('VITE_GEMINI_API_KEY não configurada');
  
  console.log(`[AI] Tentando Provedor Gemini (${modelName})...`);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  if (!text) throw new Error('Resposta vazia do Gemini');
  return text;
}

/**
 * Helper interno para chamadas ao Grok (xAI) via fetch estável.
 */
async function tryGrok(prompt: string, modelName: string = "grok-beta"): Promise<string> {
  if (!GROK_KEY) throw new Error('VITE_GROK_API_KEY não configurada');

  console.log(`[AI] Tentando Provedor Grok (${modelName})...`);
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${GROK_KEY}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API respondeu com status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) throw new Error('Resposta vazia do Grok');
  return content;
}

export const aiService = {
  /**
   * Melhora a clareza e gramática de um texto com Fallback em Cascata.
   */
  suggestClausula: async (contexto: string, promptUsuario: string): Promise<string> => {
    const promptFull = `${SYSTEM_INSTRUCTION}\n\nContexto: ${contexto}\nFormate o seguinte texto:\n${promptUsuario}`;

    // --- CASCATA DE RESILIÊNCIA ---
    
    // Passo 1: Gemini (Flash)
    try {
      return await tryGemini(promptFull, "gemini-1.5-flash");
    } catch (e) {
      console.warn('[AI] Gemini 1.5 Flash falhou, tentando fallback...');
    }

    // Passo 2: Grok (Beta)
    try {
      return await tryGrok(promptFull, "grok-beta");
    } catch (e) {
      console.warn('[AI] Grok Beta falhou, ativando modo de segurança...');
    }

    // Passo 3: Fallback Final (Offline)
    console.error('[AI] Todos os provedores de nuvem falharam. Ativando [Modo Offline].');
    return `${promptUsuario}\n\n[Modo Offline: IA indisponível no momento]`;
  },

  /**
   * Refina rascunhos corrigindo apenas ortografia e gramática.
   */
  improveDraft: async (text: string) => {
    return aiService.suggestClausula("Revisão Gramatical", text);
  },

  /**
   * Gera minutas de sentenças arbitrais com cascata de qualidade.
   */
  generateSentence: async (processoContext: string, fatos: string) => {
    const prompt = `Gere uma minuta de sentença baseada no contexto: ${processoContext} e fatos: ${fatos}. Siga a Lei 9.307/96.`;
    
    try {
      // Para sentenças, tentamos o Pro primeiro por qualidade, mas caímos na cascata padrão se falhar
      try {
        return await tryGemini(prompt, "gemini-1.5-pro");
      } catch {
        return await aiService.suggestClausula("Geração de Sentença", prompt);
      }
    } catch (e) {
      return `${fatos}\n\n[Modo Offline: Falha na geração da sentença]`;
    }
  },

  /**
   * Extração de dados estruturados com fallback resiliente.
   */
  extractMechanicalData: async (text: string) => {
    const prompt = `Extraia nomes, datas e valores deste texto e retorne APENAS um objeto JSON válido:\n\n${text}`;
    
    try {
      const response = await aiService.suggestClausula("Extração de Dados", prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('[AI] Erro crítico na extração mecânica:', e);
      return null;
    }
  }
};

export default aiService;

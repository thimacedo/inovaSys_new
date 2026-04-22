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

const SYSTEM_INSTRUCTION = `Você é um Assistente Administrativo da InovaSys dedicado EXCLUSIVAMENTE à digitação, formatação e revisão ortográfica.

REGRAS DE OURO (PROIBIÇÕES ABSOLUTAS):
1. NÃO decida, sugira ou influencie o mérito de qualquer processo.
2. NÃO analise provas, documentos ou anexos para buscar contradições.
3. NÃO sugira providências processuais ou estratégias jurídicas.
4. Sua função é puramente MECÂNICA de suporte à organização documental.

O Árbitro deve ser referido como Juiz de Fato e de Direito (Art. 18 da Lei 9.307/96).
Ao formatar textos, siga as normas da ABNT e mantenha a linguagem formal culta.`;

/**
 * Helper interno para chamadas ao Gemini com log de auditoria.
 */
async function tryGemini(prompt: string, modelName: string = "gemini-1.5-flash"): Promise<string> {
  if (!genAI) throw new Error('VITE_GEMINI_API_KEY não configurada');
  
  console.log(`[AI] Transcrição/Formatação via Gemini (${modelName})...`);
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

  console.log(`[AI] Transcrição/Formatação via Grok (${modelName})...`);
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
   * Formata e corrige rascunhos humanos com Fallback em Cascata.
   */
  formatDraft: async (contexto: string, textoBruto: string): Promise<string> => {
    const promptFull = `${SYSTEM_INSTRUCTION}\n\nATIVIDADE: Formatação Administrativa\nTEMA: ${contexto}\nTEXTO FORNECIDO PELO USUÁRIO:\n${textoBruto}\n\nINSTRUÇÃO: Corrija gramática, ortografia e aplique formatação formal. Não altere os fatos narrados.`;

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
    return `${textoBruto}\n\n[Modo Offline: IA indisponível para revisão no momento]`;
  },

  /**
   * Refina rascunhos corrigindo apenas ortografia e gramática.
   */
  improveDraft: async (text: string) => {
    return aiService.formatDraft("Revisão Gramatical Geral", text);
  },

  /**
   * Formata minutas de sentenças fornecidas pelo Juiz Arbitral.
   */
  formatSentenceDraft: async (processoContext: string, rascunhoJuiz: string) => {
    const prompt = `Formate o seguinte rascunho de sentença arbitral seguindo a Lei 9.307/96. 
    Mantenha estritamente o conteúdo e a decisão fornecida pelo Juiz de Fato e de Direito. 
    Contexto do Processo: ${processoContext}
    Rascunho a ser formatado: ${rascunhoJuiz}`;
    
    try {
      try {
        return await tryGemini(prompt, "gemini-1.5-pro");
      } catch {
        return await aiService.formatDraft("Formatação de Sentença", rascunhoJuiz);
      }
    } catch (e) {
      return `${rascunhoJuiz}\n\n[Erro: Falha na formatação da sentença]`;
    }
  },

  /**
   * Extração MECÂNICA de dados estruturados.
   */
  extractMechanicalData: async (text: string) => {
    const prompt = `Extraia mecânicamente nomes, CPFs, datas e valores deste texto. 
    Retorne APENAS um objeto JSON válido. Não interprete o conteúdo.
    Texto:\n\n${text}`;
    
    try {
      const response = await aiService.formatDraft("Extração de Metadados", prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('[AI] Erro crítico na extração mecânica:', e);
      return null;
    }
  }
};

export default aiService;

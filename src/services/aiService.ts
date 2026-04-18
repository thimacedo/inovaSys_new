import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `Você é um Assistente Administrativo de Digitação e Formatação da InovaSys, uma plataforma de Câmaras de Arbitragem.
Sua função é ESTRITAMENTE MECÂNICA E ADMINISTRATIVA: formatar textos, corrigir gramática, e gerar minutas de documentos BASEADAS EXCLUSIVAMENTE nas diretrizes explícitas fornecidas pelo usuário.
DIRETRIZ IMUTÁVEL: Você NUNCA deve analisar provas, julgar mérito, identificar contradições, sugerir caminhos jurídicos ou influenciar a decisão do árbitro. Se for solicitado a analisar o mérito de um caso, recuse-se e informe que sua função é apenas formatação textual.`;

export const aiService = {
  /**
   * Formata e melhora a clareza gramatical de uma cláusula ou parágrafo.
   */
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });

      const prompt = `Formate o seguinte texto solicitado pelo usuário em linguagem formal e culta, sem alterar o sentido ou o mérito:\n${promptUsuario}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('[aiService] Erro na geração de conteúdo:', error);
      if (error.message?.includes('API key')) return `[ERRO IA]: Chave de acesso inválida ou ausente.`;
      return `[ERRO IA]: Falha na rede ou bloqueio de segurança. Verifique o console do navegador.`;
    }

  },

  /**
   * Gera o esqueleto (template preenchido) da sentença com base ESTRITAMENTE no que o árbitro ditou/escreveu.
   */
  generateSentence: async (dadosProcesso: any, diretrizes: string) => {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const prompt = `Crie um documento HTML formatado com a estrutura de uma Sentença Arbitral. 
      Preencha o cabeçalho com os dados: ${JSON.stringify(dadosProcesso)}.
      Para a fundamentação e o dispositivo, TRANSCREVA e FORMATE o seguinte texto ditado pelo árbitro, sem adicionar nenhum argumento novo: 
      "${diretrizes}"
      
      Retorne APENAS o HTML formatado.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      throw new Error('Falha ao gerar rascunho de sentença na nuvem.');
    }
  },

  /**
   * Corrige erros gramaticais e de formatação de um rascunho feito pelo humano.
   */
  improveDraft: async (text: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });

      const prompt = `Revise o seguinte texto corrigindo apenas ortografia, gramática e coesão textual, mantendo rigorosamente a narrativa e a decisão intactas:\n\n${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      return text;
    }
  },

  /**
   * Extração mecânica de dados (ex: ler um CNPJ de um PDF para preencher um formulário).
   */
  extractMechanicalData: async (text: string) => {
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error('API Key missing');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `Você é um extrator de dados estruturados. Sua única tarefa é identificar e extrair informações mecânicas (Nomes, CPFs, Valores, Datas) de textos. Não interprete nem avalie nada. Retorne apenas JSON.`
      });

      const prompt = `Extraia os dados mecânicos do seguinte texto:\n\n${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultText = response.text();
      
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      return null;
    }
  }
};

export default aiService;

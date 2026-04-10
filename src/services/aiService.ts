/**
 * @file aiService.ts
 * @description Serviço de IA refatorado para consumir a API interna (Server-side)
 * em vez de chamar o SDK diretamente no cliente, protegendo a chave de API.
 */

export const aiService = {
  /**
   * Envia um prompt para o modelo de IA via endpoint de servidor interno.
   */
  askAI: async (prompt: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro na resposta da IA');
      }

      const data = await res.json();
      return data.text;
    } catch (error) {
      console.error('[AI Service Error]:', error);
      // Fallback para mock em caso de erro de conexão ou configuração
      return `[Fallback]: Como assistente InovaSys, recomendo verificar nosso regulamento. No momento, o serviço de IA está indisponível para resposta dinâmica.`;
    }
  },

  /**
   * Sugere uma cláusula compromissória baseada em contexto.
   */
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    const fullPrompt = `Você é o assistente jurídico oficial da Câmara InovaSys de Mediação e Arbitragem.
    Contexto: ${contexto}
    Pergunta do Usuário: ${promptUsuario}
    Responda de forma profissional, direta e juridicamente embasada de acordo com as leis brasileiras de arbitragem (Lei 9.307/96).`;

    return aiService.askAI(fullPrompt);
  },

  /**
   * Melhora um rascunho jurídico.
   */
  improveDraft: async (text: string) => {
    const prompt = `Refine o seguinte rascunho jurídico para torná-lo mais formal, claro e condizente com padrões de câmaras de arbitragem modernas:\n\n${text}`;
    return aiService.askAI(prompt);
  }
};

export default aiService;

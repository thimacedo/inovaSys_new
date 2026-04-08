/**
 * Serviço de Inteligência Artificial do InovaSys
 * Preparado para integração com Google Gemini ou OpenAI.
 */
export const aiService = {
  /**
   * Sugere melhorias ou cria cláusulas baseadas em contexto jurídico.
   */
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    // Simulação de chamada de IA (POC)
    // Em produção, aqui seria feita uma chamada para uma Edge Function do Supabase
    // que consumiria com segurança a API_KEY do Gemini ou OpenAI.
    
    console.log("[AI Service] Gerando sugestão para:", promptUsuario);

    // Mock de resposta inteligente
    const mockRespostas: Record<string, string> = {
      'clausula arbiter': `CLÁUSULA COMPROMISSÓRIA CHEIA:\n\n"Qualquer controvérsia decorrente deste contrato ou a ele relacionada será resolvida definitivamente por arbitragem, sob as regras da Câmara InovaSys, por um ou mais árbitros nomeados de acordo com as referidas regras, com sede em [CIDADE/ESTADO]. O idioma da arbitragem será o Português."`,
      'notificacao': `Prezada Parte,\n\nNa qualidade de árbitro nomeado para o Processo nº {numero_processo}, venho por meio desta notificar V. Sa. sobre a abertura do prazo de 15 (quinze) dias para manifestação acerca dos fatos narrados na petição inicial de {requerente_nome}.`,
    };

    const key = promptUsuario.toLowerCase();
    let response = "";

    if (key.includes('clausula') || key.includes('arbitragem')) {
      response = mockRespostas['clausula arbiter'];
    } else if (key.includes('notificacao') || key.includes('prazo')) {
      response = mockRespostas['notificacao'];
    } else {
      response = `[IA Sugestão]: Com base no contexto de {requerente_nome}, sugere-se a inclusão de um parágrafo que reforce o princípio da confidencialidade da arbitragem e a fixação de custas iniciais conforme a Tabela de Custas da Câmara.`;
    }

    return new Promise(resolve => setTimeout(() => resolve(response), 1500));
  },

  /**
   * Melhora o estilo de escrita de um parágrafo.
   */
  improveDraft: async (text: string) => {
    return `[Versão Melhorada por IA]: ${text.trim()} (Refinado para maior clareza jurídica e concisão, evitando termos arcaicos e focando na objetividade processual).`;
  }
};

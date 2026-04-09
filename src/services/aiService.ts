export const aiService = {
  suggestClausula: async (contexto: string, promptUsuario: string) => {
    // Integração real via Supabase Edge Function no futuro
    const key = promptUsuario.toLowerCase();
    let response = "";

    if (key.includes('clausula') || key.includes('arbitragem')) {
      response = `CLÁUSULA COMPROMISSÓRIA:\n"Qualquer controvérsia decorrente deste contrato será resolvida definitivamente por arbitragem sob as regras da Câmara InovaSys..."`;
    } else {
      response = `[Sugestão IA baseada em ${contexto}]: Recomenda-se detalhar as custas processuais conforme a Tabela de Custas vigente.`;
    }

    return new Promise(resolve => setTimeout(() => resolve(response), 800));
  },

  improveDraft: async (text: string) => {
    return `[Refinado]: ${text.trim()} (Texto ajustado para clareza e formalidade jurídica).`;
  }
};
export default aiService;

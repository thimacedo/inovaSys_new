export const financialCalculatorService = {
  /**
   * Calcula juros simples de 1% ao mês.
   */
  calcularJurosSimples: (valor: number, dataVencimento: Date): { valorFinal: number, juros: number, diasAtraso: number } => {
    const hoje = new Date();
    if (hoje <= dataVencimento) {
      return { valorFinal: valor, juros: 0, diasAtraso: 0 };
    }

    const diffTime = Math.abs(hoje.getTime() - dataVencimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 1% ao mês = 0.0333% ao dia aproximadamente
    const taxaDiaria = 0.01 / 30;
    const juros = valor * taxaDiaria * diffDays;

    return {
      valorFinal: valor + juros,
      juros,
      diasAtraso: diffDays
    };
  },

  /**
   * Corrige valor baseado em um índice fixo simulado (IPCA médio de 0.5% ao mês).
   * Em produção, isso deveria consumir uma API de índices.
   */
  corrigirIPCA: (valor: number, dataReferencia: Date): number => {
    const hoje = new Date();
    const meses = (hoje.getFullYear() - dataReferencia.getFullYear()) * 12 + (hoje.getMonth() - dataReferencia.getMonth());
    
    if (meses <= 0) return valor;

    // Simulação de 0.5% ao mês acumulado
    return valor * Math.pow(1 + 0.005, meses);
  },

  /**
   * 🧮 MOTOR DE CÁLCULO DE SPLIT DINÂMICO
   * Automatiza a divisão de valores entre Plataforma, Câmara e Árbitros.
   * 
   * @param amount Valor total bruto (em reais)
   * @param config Configurações de taxas e IDs dos recebedores
   * @returns Payload estruturado para o IuguService com valores em centavos
   */
  calculateSplit: (amount: number, config: any) => {
    // Conversão inicial para centavos para evitar erros de ponto flutuante
    const totalCents = Math.round(amount * 100);
    
    // 1. Taxa da Plataforma (InovaSys) - Padrão 10%
    const plataformaTaxa = config.plataformaTaxa ?? 0.10;
    const plataformaCents = Math.round(totalCents * plataformaTaxa);
    
    // Restante após taxa da plataforma
    const remainder = totalCents - plataformaCents;
    
    // 2. Custas da Câmara - Padrão 40% do restante ou valor fixo
    let camaraCents = 0;
    if (config.camaraValorFixo) {
      camaraCents = Math.round(config.camaraValorFixo * 100);
    } else {
      const camaraTaxa = config.camaraTaxa ?? 0.40;
      camaraCents = Math.round(remainder * camaraTaxa);
    }
    
    // Segurança: Câmara não pode receber mais do que o que sobrou da plataforma
    camaraCents = Math.min(camaraCents, remainder);
    
    // 3. Honorários do Árbitro - Restante absoluto do montante
    // Cálculo por subtração direta para garantir que a soma seja EXATAMENTE o total
    const arbitroCents = totalCents - plataformaCents - camaraCents;
    
    // Validação de integridade (Soma das partes === Total)
    if (plataformaCents + camaraCents + arbitroCents !== totalCents) {
      throw new Error("[FinancialCalculator] Erro Crítico: A soma do split não corresponde ao total.");
    }

    return {
      total_cents: totalCents,
      splits: [
        {
          recipient_id: config.plataformaIuguId,
          cents: plataformaCents,
          name: 'Plataforma InovaSys'
        },
        {
          recipient_id: config.camaraIuguId,
          cents: camaraCents,
          name: 'Custas Administrativas Câmara'
        },
        {
          recipient_id: config.arbitroIuguId,
          cents: arbitroCents,
          name: 'Honorários Árbitro'
        }
      ].filter(s => s.cents > 0 && s.recipient_id) // Remove entradas zeradas ou sem ID
    };
  }
};

export default financialCalculatorService;

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
  }
};

export default financialCalculatorService;

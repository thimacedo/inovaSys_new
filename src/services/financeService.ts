/**
 * Serviço especializado em cálculos financeiros para liquidação de sentenças e custas.
 * Focado em Juros de 1% a.m. e Correção Monetária conforme padrões de Câmaras de Arbitragem.
 */
export const financeService = {
  /**
   * Calcula juros simples de 1% ao mês entre duas datas usando diferença civil de meses (UTC).
   * 
   * Args:
   *   valor (number): O valor base para cálculo.
   *   inicio (Date): Data inicial da incidência.
   *   fim (Date): Data final (ou data atual).
   * 
   * Returns:
   *   object: Contendo valor original, valor de juros, valor total e contagem de meses.
   */
  calculateInterest: (valor: number, inicio: Date, fim: Date) => {
    // Uso de métodos UTC para evitar interferência de fuso horário local
    const anos = fim.getUTCFullYear() - inicio.getUTCFullYear();
    const meses = fim.getUTCMonth() - inicio.getUTCMonth();
    let totalMeses = (anos * 12) + meses;

    // Se o dia final for menor que o dia inicial, o último mês ainda não completou seu ciclo
    if (fim.getUTCDate() < inicio.getUTCDate()) {
      totalMeses--;
    }

    // Garantir que não seja negativo
    totalMeses = Math.max(0, totalMeses);
    
    const taxaMensal = 0.01; // 1% a.m.
    const valorJuros = valor * taxaMensal * totalMeses;
    
    return {
      valorOriginal: valor,
      valorJuros: Number(valorJuros.toFixed(2)),
      valorTotal: Number((valor + valorJuros).toFixed(2)),
      meses: totalMeses,
      referencia: {
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0]
      }
    };
  },

  /**
   * Formata valores para moeda brasileira (BRL).
   */
  formatBRL: (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
};

export default financeService;

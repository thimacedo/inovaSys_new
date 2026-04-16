import { describe, it, expect } from 'vitest';
import { financeService } from './financeService';

describe('financeService - Motor de Cálculos', () => {
  it('deve calcular juros simples de 1% ao mês corretamente', () => {
    const valorOriginal = 1000;
    // 01/01/2023 até 01/03/2023 = 2 meses exatos
    const dataInicial = new Date('2023-01-01T00:00:00Z');
    const dataFinal = new Date('2023-03-01T00:00:00Z'); 
    
    const resultado = financeService.calculateInterest(valorOriginal, dataInicial, dataFinal);
    
    expect(resultado.meses).toBe(2);
    expect(resultado.valorJuros).toBe(20); // 1000 * 0.01 * 2
    expect(resultado.valorTotal).toBe(1020);
  });

  it('deve formatar valores para BRL corretamente', () => {
    // Usando o caractere de espaço inquebrável (\u00a0) que o Intl.NumberFormat gera
    const formatado = financeService.formatBRL(1234.56);
    expect(formatado).toMatch(/R\$\s1\.234,56/); // Regex aceita qualquer tipo de espaço
  });
});

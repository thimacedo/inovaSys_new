import { supabase } from '../lib/supabase';

export const financeiroService = {
  /**
   * Gera automaticamente as custas iniciais de um processo.
   */
  gerarCustasIniciais: async (processoId: string, valorCausa: number, organizationId: string) => {
    // Exemplo: Custa de Protocolo fixa de R$ 150,00 ou baseada em tabela
    const valorCusta = 150.00; 
    
    const { error } = await supabase.from('financeiro').insert({
      processo_id: processoId,
      organization_id: organizationId,
      descricao: 'Taxa de Protocolo Inicial',
      valor: valorCusta,
      tipo: 'Custa',
      status: 'Pendente',
      data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
    });

    if (error) throw error;
  },

  /**
   * Gera os honorários arbitrais (10% do valor da causa por padrão).
   */
  gerarHonorariosArbitrais: async (processoId: string, valorCausa: number, organizationId: string) => {
    const valorHonorarios = valorCausa * 0.10;

    const { error } = await supabase.from('financeiro').insert({
      processo_id: processoId,
      organization_id: organizationId,
      descricao: 'Honorários Arbitrais (10%)',
      valor: valorHonorarios,
      tipo: 'Hon_Arbitral',
      status: 'Pendente',
      data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dias
    });

    if (error) throw error;
  },

  /**
   * Busca resumo financeiro de um processo.
   */
  getResumoProcesso: async (processoId: string) => {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('processo_id', processoId);

    if (error) throw error;
    return data;
  }
};

import { supabase } from '../lib/supabase';

export const financeiroService = {
  /**
   * Lista todos os lançamentos financeiros de um processo.
   */
  listByProcesso: async (processoId: string) => {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Cria um novo lançamento financeiro.
   */
  create: async (data: any) => {
    const { error } = await supabase.from('financeiro').insert(data);
    if (error) throw error;
  },

  /**
   * Atualiza um lançamento financeiro existente.
   */
  update: async (id: string, data: any) => {
    const { error } = await supabase.from('financeiro').update(data).eq('id', id);
    if (error) throw error;
  },

  /**
   * Deleta um lançamento financeiro.
   */
  delete: async (id: string) => {
    const { error } = await supabase.from('financeiro').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Gera automaticamente as custas iniciais de um processo.
   */
  gerarCustasIniciais: async (processoId: string, valorCausa: number, organizationId: string) => {
    const valorCusta = 150.00; 
    
    const { error } = await supabase.from('financeiro').insert({
      processo_id: processoId,
      organization_id: organizationId,
      descricao: 'Taxa de Protocolo Inicial',
      valor: valorCusta,
      tipo: 'Custa',
      status: 'Pendente',
      data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) throw error;
  },

  /**
   * Gera os honorários arbitrais (10% do valor da causa por padrão).
   */
  gerarHonorariosArbitrais: async (processoId: string, valorCausa: number, organizationId: string) => {
    const valorHonorarios = (valorCausa || 0) * 0.10;

    const { error } = await supabase.from('financeiro').insert({
      processo_id: processoId,
      organization_id: organizationId,
      descricao: 'Honorários Arbitrais (10%)',
      valor: valorHonorarios,
      tipo: 'Hon_Arbitral',
      status: 'Pendente',
      data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
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

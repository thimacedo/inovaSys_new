import { supabase } from '../lib/supabase';

export interface RegistroFinanceiro {
  id: string;
  processo_id: string;
  organization_id: string;
  descricao: string;
  valor: number;
  tipo: 'Custa' | 'Hon_Arbitral' | 'Hon_Sucumbencia' | 'Outros';
  status: 'Pendente' | 'Pago' | 'Cancelado';
  data_vencimento?: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  comprovante_url?: string;
  created_at?: string;
}

export const financeiroService = {
  getByProcesso: async (processoId: string) => {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getByOrganizacao: async (orgId: string) => {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*, processos(numero_processo)')
      .eq('organization_id', orgId)
      .order('data_vencimento', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  create: async (item: Omit<RegistroFinanceiro, 'id'>) => {
    const { data, error } = await supabase
      .from('financeiro')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<RegistroFinanceiro>) => {
    const { data, error } = await supabase
      .from('financeiro')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

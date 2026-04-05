import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export interface Pagamento {
  id: number; // BIGINT
  processo_id: string; // UUID
  parcela_numero: number; // SMALLINT
  valor_parcela: number; // DECIMAL
  data_vencimento: string; // DATE
  data_pagamento?: string; // DATE
  status: string; // VARCHAR
}

export const pagamentoService = {
  async getByProcesso(processoId: string) {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('processo_id', processoId)
      .order('parcela_numero');
    
    if (error) throw error;
    return data as Pagamento[];
  },

  async create(pagamento: Partial<Pagamento>) {
    const { data, error } = await supabase
      .from('pagamentos')
      .insert([pagamento])
      .select()
      .single();
    
    if (error) throw error;
    
    await auditService.log('CRIAR_PAGAMENTO', {
      pagamento_id: data.id,
      processo_id: data.processo_id,
      parcela: data.parcela_numero
    });
    
    return data as Pagamento;
  },

  async update(id: number, updates: Partial<Pagamento>) {
    const { data, error } = await supabase
      .from('pagamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    await auditService.log('ATUALIZAR_PAGAMENTO', {
      pagamento_id: id,
      status: updates.status
    });
    
    return data as Pagamento;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

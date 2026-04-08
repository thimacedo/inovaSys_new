import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export interface Andamento {
  id: string;
  processo_id: string;
  descricao: string;
  data_registro: string;
  usuario_id: string;
  tipo: 'Despacho' | 'Atualizacao' | 'Mudanca_Status' | 'Outro';
}

export const historyService = {
  async getByProcesso(processoId: string) {
    try {
      const { data, error } = await supabase
        .from('andamentos_processo')
        .select('*')
        .eq('processo_id', processoId)
        .order('data_registro', { ascending: false });

      if (error) throw error;
      return data as Andamento[];
    } catch (error: any) {
      console.error('[HistoryService:GET] Erro ao buscar andamentos:', error.message);
      return [];
    }
  },

  async addAndamento(payload: Omit<Andamento, 'id' | 'data_registro'>) {
    try {
      const { data, error } = await supabase
        .from('andamentos_processo')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      await auditService.log('CRIAR_ANDAMENTO', { 
        processo_id: payload.processo_id, 
        tipo: payload.tipo,
        descricao: payload.descricao 
      });

      return data as Andamento;
    } catch (error: any) {
      console.error('[HistoryService:ADD] Erro ao inserir andamento:', error.message);
      throw error;
    }
  }
};

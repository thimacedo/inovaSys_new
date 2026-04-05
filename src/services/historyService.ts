import { supabase } from '../lib/supabase';

export interface Andamento {
  id: string;
  processo_id: string;
  usuario_id: string;
  descricao: string;
  tipo: string;
  created_at: string;
  perfis?: {
    nome: string;
  };
}

export const historyService = {
  async getAndamentosPorProcesso(processoId: string) {
    const { data, error } = await supabase
      .from('andamentos_processo')
      .select(`
        id, processo_id, usuario_id, descricao, tipo, created_at,
        perfis ( nome )
      `)
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[HistoryService] Erro ao buscar andamentos:', error);
      throw error;
    }

    // Normalizar o retorno do join (Supabase pode retornar array ou objeto dependendo da relação)
    const normalizedData = (data as any[]).map(item => ({
      ...item,
      perfis: Array.isArray(item.perfis) ? item.perfis[0] : item.perfis
    }));

    return normalizedData as Andamento[];
  },

  async addAndamento(processoId: string, descricao: string, tipo: string = 'atualizacao') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Sessão não encontrada.");

    const { data, error } = await supabase
      .from('andamentos_processo')
      .insert([{
        processo_id: processoId,
        usuario_id: session.user.id,
        descricao,
        tipo
      }])
      .select()
      .single();

    if (error) {
      console.error('[HistoryService] Erro ao inserir andamento:', error);
      throw error;
    }
    return data;
  }
};

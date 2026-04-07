import { supabase } from '../lib/supabase';

export interface Processo {
  id: string;
  numero_processo: string;
  requerente_nome: string;
  requerente_doc: string;
  requerente_end?: string;
  requerido_nome?: string;
  requerido_doc?: string;
  requerido_end?: string;
  status: string;
  valor_causa: number;
  resumo_fatos?: string;
  created_at: string;
  user_id: string;
  camara_id?: string;
  organization_id?: string;
  arbitro_id?: string;
}

const SELECT_FIELDS = `
  id, numero_processo, requerente_nome, requerente_doc, requerente_end,
  requerido_nome, requerido_doc, requerido_end, status, valor_causa, 
  resumo_fatos, created_at, user_id, camara_id, organization_id, arbitro_id
`;

export const processService = {
  async getAll(page = 1, pageSize = 10, searchTerm = '') {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    try {
      let query = supabase
        .from('processos')
        .select(SELECT_FIELDS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        query = query.or(
          `numero_processo.ilike.%${term}%,requerente_nome.ilike.%${term}%,requerido_nome.ilike.%${term}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data as Processo[]) || [], count: count || 0 };
    } catch (error: any) {
      this.logError('GET_ALL', error);
      return { data: [], count: 0 };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('processos').select(SELECT_FIELDS).eq('id', id).single();
      if (error) throw error;
      return data as Processo;
    } catch (error: any) {
      this.logError('GET_BY_ID', error);
      throw error;
    }
  },

  async create(payload: any) {
    if (!payload?.user_id || payload.user_id === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: ID do usuário ausente ou incorreto.");
    }
    if (!payload?.organization_id || payload.organization_id === "SEU_ORG_ID_AQUI") {
      throw new Error("Sessão inválida: ID da organização ausente ou incorreto.");
    }
    const dbPayload = {
      numero_processo: String(payload.numero_processo || ''),
      requerente_nome: String(payload.requerente_nome || ''),
      requerente_doc: String(payload.requerente_doc || payload.requerente_documento || ''),
      requerente_end: payload.requerente_end || null,
      requerido_nome: payload.requerido_nome || null,
      requerido_doc: payload.requerido_doc || null,
      requerido_end: payload.requerido_end || null,
      valor_causa: payload.valor_causa ? Number(payload.valor_causa) : 0,
      resumo_fatos: payload.resumo_fatos || null,
      status: payload.status || 'Protocolado',
      user_id: payload.user_id,
      camara_id: payload.camara_id || null,
      organization_id: payload.organization_id,
      arbitro_id: payload.arbitro_id || null
    };

    try {
      const { data, error } = await supabase.from('processos').insert([dbPayload]).select('id, numero_processo').single();
      if (error) throw error;
      return data;
    } catch (error: any) {
      this.logError('CREATE', error);
      throw error;
    }
  },

  async update(id: string, payload: Partial<Processo>) {
    try {
      const { data, error } = await supabase.from('processos').update(payload).eq('id', id).select(SELECT_FIELDS).single();
      if (error) throw error;
      return data as Processo;
    } catch (error: any) {
      this.logError('UPDATE', error);
      throw error;
    }
  },

  async publicSearch(numero: string, documento: string) {
    try {
      const { data, error } = await supabase.from('processos').select(SELECT_FIELDS)
        .eq('numero_processo', numero).or(`requerente_doc.eq.${documento},requerido_doc.eq.${documento}`).maybeSingle();
      if (error) throw error;
      return data as Processo;
    } catch (error: any) {
      this.logError('PUBLIC_SEARCH', error);
      return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from('processos').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error: any) {
      this.logError('DELETE', error);
      throw error;
    }
  },

  async assignArbitrator(processoId: string, arbitroId: string) {
    try {
      const { data, error } = await supabase.from('processos').update({ arbitro_id: arbitroId }).eq('id', processoId).select(SELECT_FIELDS).single();
      if (error) throw error;
      return data as Processo;
    } catch (error: any) {
      this.logError('ASSIGN_ARBITRATOR', error);
      throw error;
    }
  },

  logError(context: string, error: any) {
    console.error(`[ProcessService:${context}] ERRO:`, error.message || error);
  }
};

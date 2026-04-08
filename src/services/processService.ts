import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

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
      
      // Notificar Admins da câmara (somente o Admin da organização vinculada)
      if (dbPayload.camara_id) {
        const { data: admins } = await supabase
          .from('perfis')
          .select('id')
          .eq('camara_id', dbPayload.camara_id)
          .eq('tipo_usuario', 'admin');
          
        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            tipo: 'novo_processo',
            titulo: 'Novo Processo Protocolado',
            mensagem: `O processo nr. ${data.numero_processo} aguarda nomeação de árbitro.`,
            processo_id: data.id,
            lida: false
          }));
          await supabase.from('notificacoes').insert(notifications);
        }
      }
      
      await auditService.log('CRIAR_PROCESSO', { processo_id: data.id, numero_processo: data.numero_processo });
      return data;
    } catch (error: any) {
      this.logError('CREATE', error);
      throw error;
    }
  },

  async update(id: string, payload: Partial<Processo>) {
    try {
      // Pega o estado anterior para checar se houve mudança real de árbitro (opcional, aqui mandaremos toda vez q repassar no payload)
      // Para evitar flood, podemos só mandar se vier no payload explícito
      const { data, error } = await supabase.from('processos').update(payload).eq('id', id).select(SELECT_FIELDS).single();
      if (error) throw error;
      
      // Notifica o árbitro recém-nomeado
      if (payload.arbitro_id) {
        await supabase.from('notificacoes').insert([{
           user_id: payload.arbitro_id,
           tipo: 'nomeacao',
           titulo: 'Nomeação de Processo',
           mensagem: `Você foi nomeado ou renomeado para gerenciar o processo nr. ${(data as Processo).numero_processo}.`,
           processo_id: data.id,
           lida: false
        }]);

        // Consulta os dados do árbitro para enviar E-mail
        const { data: arbData } = await supabase.from('perfis').select('email, nome').eq('id', payload.arbitro_id).single();
        if (arbData && arbData.email) {
          await fetch('/api/vercel/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: arbData.email,
              subject: 'InovaSys: Você foi nomeado para um Processo',
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <h2 style="color: #0f172a;">Olá, ${arbData.nome || 'Árbitro'}!</h2>
                  <p>Você foi designado pelo Presidente da sua Câmara para atuar como Árbitro no processo <strong>nº ${(data as Processo).numero_processo}</strong>.</p>
                  <p>Os documentos oficiais do processo já se encontram <strong>preparados, organizados e formatados automaticamente</strong> no sistema.</p>
                  <p>Acesse a plataforma <a href="https://inovasys-navy.vercel.app">InovaSys</a> para visualizar os resumos e dar andamento aos despachos.</p>
                  <br/>
                  <p>Atenciosamente,<br/><strong>Equipe InovaSys Automations</strong></p>
                </div>
              `
            })
          }).catch(err => console.error("Falha ao enviar webhook de e-mail:", err));
        }
      }
      
      await auditService.log('ATUALIZAR_PROCESSO', { processo_id: data.id, alteracoes: payload });
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
      await auditService.log('DELETAR_PROCESSO', { processo_id: id });
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

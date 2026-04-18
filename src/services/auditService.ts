import { supabase } from '../lib/supabase';

export const auditService = {
  /**
   * Método genérico para logar ações importantes.
   */
  log: async (acao: string, detalhes: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('auditoria').insert({
        usuario_id: user.id,
        acao: acao,
        detalhes: detalhes,
        tabela: detalhes?.tabela || 'sistema',
        registro_id: detalhes?.id || null
      });

      if (error) console.warn('[AuditService] Erro ao registrar log genérico:', error);
    } catch (e) {
      console.error('[AuditService] Erro crítico no log genérico:', e);
    }
  },

  /**
   * Registra a visualização de um documento por um usuário com captura de contexto.
   */
  registrarVisualizacao: async (docNome: string, processoId: string, userId: string) => {
    try {
      // Capturar IP de forma resiliente
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json().catch(() => ({ ip: 'Desconhecido' })) : { ip: 'Desconhecido' };

      const { error } = await supabase.from('logs_visualizacao').insert({
        usuario_id: userId,
        documento_nome: docNome,
        processo_id: processoId,
        ip_address: ipData.ip,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      if (error) console.warn('[AuditService] Erro ao registrar log:', error);
    } catch (e) {
      console.error('[AuditService] Erro crítico no log:', e);
    }
  },

  /**
   * Busca histórico de visualizações de um processo com join de perfil.
   */
  getLogsByProcesso: async (processoId: string) => {
    // Usamos a sintaxe correta para join via foreign key usuario_id -> perfis
    const { data, error } = await supabase
      .from('logs_visualizacao')
      .select(`
        *,
        perfil:usuario_id (nome)
      `)
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export default auditService;

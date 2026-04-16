import { supabase } from '../lib/supabase';

export const auditService = {
  /**
   * Registra a visualização de um documento por um usuário com captura de contexto.
   */
  registrarVisualizacao: async (docNome: string, processoId: string, userId: string) => {
    try {
      // Capturar IP com timeout de 2s para evitar travamento da UI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
        .catch(() => null);
      
      clearTimeout(timeoutId);
      
      const ipData = ipResponse ? await ipResponse.json().catch(() => ({ ip: '0.0.0.0' })) : { ip: '0.0.0.0' };

      const { error } = await supabase.from('logs_visualizacao').insert({
        usuario_id: userId,
        documento_nome: docNome,
        processo_id: processoId,
        ip_address: ipData.ip || '0.0.0.0',
        user_agent: navigator.userAgent
      });

      if (error) {
        console.warn('[AuditService] Erro ao persistir no Supabase:', error.message);
      }
    } catch (e) {
      console.error('[AuditService] Erro crítico ao registrar log:', e);
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

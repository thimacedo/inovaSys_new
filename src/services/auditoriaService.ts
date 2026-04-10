import { supabase } from '../lib/supabase';

/**
 * @file auditoriaService.ts
 * @description Centraliza o registro de logs de auditoria no sistema.
 */

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'action';

export const auditoriaService = {
  /**
   * Registra uma ação na tabela de auditoria.
   */
  logAudit: async (
    acao: AuditAction,
    entidade: string,
    entidade_id: string,
    dados_antes?: Record<string, any>,
    dados_depois?: Record<string, any>
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('auditoria').insert({
        acao,
        entidade,
        entidade_id,
        autor_id: user?.id,
        dados_antes: dados_antes ? JSON.stringify(dados_antes) : null,
        dados_depois: dados_depois ? JSON.stringify(dados_depois) : null,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      // Falha silenciosa no cliente para não interromper fluxo principal, 
      // mas logado no console para debug.
      console.error('[Auditoria] Falha ao registrar log:', error);
    }
  }
};

export default auditoriaService;

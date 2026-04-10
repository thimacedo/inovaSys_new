import { supabase } from '../lib/supabase';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

export async function logAudit(
  acao: AuditAction,
  entidade: string,
  entidade_id: string,
  dados_antes?: Record<string, any>,
  dados_depois?: Record<string, any>
) {
  try {
    const { error } = await supabase.from('auditoria').insert({
      acao,
      entidade,
      entidade_id,
      dados_antes: dados_antes ? JSON.stringify(dados_antes) : null,
      dados_depois: dados_depois ? JSON.stringify(dados_depois) : null,
    });

    if (error) {
      console.error('[Auditoria] Falha ao registrar log:', error);
    }
  } catch (error) {
    // Não propagar erro para não quebrar operação principal
    console.error('[Auditoria] Erro não tratado:', error);
  }
}
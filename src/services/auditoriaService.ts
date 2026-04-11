import { supabase } from '../lib/supabase';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

/**
 * Registra uma ação de auditoria no banco de dados
 * @param acao Tipo da ação realizada
 * @param tabela Nome da tabela afetada
 * @param registro_id ID do registro afetado
 * @param dados_antigos Estado anterior do objeto (opcional)
 * @param dados_novos Estado posterior do objeto (opcional)
 */
export async function logAudit(
  acao: AuditAction,
  tabela: string,
  registro_id: string,
  dados_antigos?: any,
  dados_novos?: any
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const usuario_id = session?.user?.id;

    const { error } = await supabase.from('auditoria').insert({
      acao,
      tabela,
      registro_id,
      usuario_id,
      dados_antigos: dados_antigos ? (typeof dados_antigos === 'string' ? JSON.parse(dados_antigos) : dados_antigos) : {},
      dados_novos: dados_novos ? (typeof dados_novos === 'string' ? JSON.parse(dados_novos) : dados_novos) : {},
    });

    if (error) {
      console.error('[Auditoria] Falha ao registrar log:', error);
    }
  } catch (error) {
    // Não propagar erro para não quebrar operação principal
    console.error('[Auditoria] Erro não tratado:', error);
  }
}
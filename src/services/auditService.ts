import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  usuario_id: string;
  acao: string;
  tabela: string;
  registro_id?: string;
  dados_antigos?: any;
  dados_novos?: any;
  created_at: string;
}

export const auditService = {
  async log(acao: string, detalhes: any = {}, tabela: string = 'sistema', registroId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unifica com o esquema do AuditRepository
      const { error } = await supabase
        .from('auditoria')
        .insert([{
          usuario_id: user.id,
          acao,
          tabela,
          registro_id: registroId,
          dados_antigos: detalhes.antigo || {},
          dados_novos: detalhes.novo || detalhes,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Aviso: Falha ao registrar auditoria.', error.message);
      }
    } catch (e) {
      console.error('Erro no serviço de auditoria:', e);
    }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('auditoria')
      .select(`
        *,
        perfil:usuario_id (nome, email)
      `)
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (error) throw error;
    return data;
  }
};

export default auditService;


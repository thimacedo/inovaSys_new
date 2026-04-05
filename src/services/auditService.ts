import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  usuario_id: string;
  usuario_nome?: string;
  acao: string;
  detalhes: any;
  data_hora: string;
}

export const auditService = {
  async log(acao: string, detalhes: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let usuarioNome = user.email || 'Desconhecido';
      
      try {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('nome')
          .eq('id', user.id)
          .single();
        
        if (perfil?.nome) {
          usuarioNome = perfil.nome;
        }
      } catch (e) {
        // Ignorar erro se não conseguir buscar o perfil
      }

      const { error } = await supabase
        .from('auditoria')
        .insert([{
          usuario_id: user.id,
          usuario_nome: usuarioNome,
          acao,
          detalhes,
          data_hora: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Aviso: Falha ao registrar auditoria. A tabela "auditoria" pode não existir.', error.message);
      }
    } catch (e) {
      console.error('Erro no serviço de auditoria:', e);
    }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('auditoria')
      .select('*')
      .order('data_hora', { ascending: false })
      .limit(500);
    
    if (error) throw error;
    return data as AuditLog[];
  }
};

import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export interface Perfil {
  id: string;
  email: string;
  nome?: string;
  tipo_usuario: string;
  camara_id?: string;
  organization_id?: string;
  data_renovacao?: string;
  cpf?: string;
  rg?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
  endereco?: string;
  endereco_profissional?: string;
  created_at: string;
}

export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Perfil[];
  },

  async getProfile(userId: string) {
    if (!userId || userId === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: ID do usuário ausente ou incorreto.");
    }
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as Perfil;
  },

  async getTipoUsuario(userId: string) {
    if (!userId || userId === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: ID do usuário ausente ou incorreto.");
    }
    const { data, error } = await supabase
      .from('perfis')
      .select('tipo_usuario')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.tipo_usuario as string;
  },

  async update(id: string, updates: Partial<Perfil>) {
    if (!id || id === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: ID do usuário ausente ou incorreto.");
    }
    const { data, error } = await supabase
      .from('perfis')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      // Se o erro for de coluna inexistente, tenta remover os novos campos e atualizar apenas o básico
      if (error.message.includes('Could not find the') && error.message.includes('column')) {
        const legacyOnly = { ...updates };
        const newFields = ['rg', 'nacionalidade', 'estado_civil', 'profissao', 'endereco_profissional'];
        newFields.forEach(f => delete (legacyOnly as any)[f]);

        const { data: retryData, error: retryError } = await supabase
          .from('perfis')
          .update(legacyOnly)
          .eq('id', id)
          .select()
          .single();
        
        if (retryError) throw retryError;

        await auditService.log('ATUALIZAR_USUARIO', {
          usuario_afetado_id: id,
          campos_alterados: Object.keys(legacyOnly)
        });

        return retryData as Perfil;
      }
      throw error;
    }
    
    await auditService.log('ATUALIZAR_USUARIO', {
      usuario_afetado_id: id,
      campos_alterados: Object.keys(updates),
      novo_tipo: updates.tipo_usuario
    });
    
    return data as Perfil;
  },

  async delete(id: string) {
    if (!id || id === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: ID do usuário ausente ou incorreto.");
    }
    
    console.log('Iniciando tentativa de exclusão do ID:', id);

    // Primeiro, verificar se o usuário existe para dar um erro mais preciso
    const { data: userExists, error: fetchError } = await supabase
      .from('perfis')
      .select('id, email, nome')
      .eq('id', id)
      .maybeSingle(); // Usar maybeSingle para evitar erro automático se não encontrar
    
    if (fetchError) {
      console.error('Erro técnico ao buscar usuário:', fetchError);
      throw new Error(`Erro ao verificar existência do usuário: ${fetchError.message}`);
    }

    if (!userExists) {
      console.warn('Usuário não localizado no banco de dados. ID:', id);
      // Pode ser que o usuário já tenha sido excluído ou o ID esteja incorreto
      throw new Error("Usuário não encontrado no banco de dados. Tente atualizar a página.");
    }

    console.log('Usuário identificado para exclusão:', userExists.email);

    // Log de auditoria (não bloqueante)
    auditService.log('DELETAR_USUARIO', { 
      usuario_afetado_id: id, 
      usuario_afetado_email: userExists.email,
      usuario_afetado_nome: userExists.nome
    }).catch(e => {
      console.warn('Falha ao registrar log de auditoria para exclusão:', e);
    });
    
    // Tentar deletar o perfil
    const { data, error } = await supabase
      .from('perfis')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Erro do Supabase ao deletar perfil:', error);
      // Erro de chave estrangeira (registros vinculados)
      if (error.code === '23503') {
        const { count: procCount } = await supabase.from('processos').select('*', { count: 'exact', head: true }).or(`user_id.eq.${id},arbitro_id.eq.${id}`);
        const { count: auditCount } = await supabase.from('auditoria').select('*', { count: 'exact', head: true }).eq('usuario_id', id);
        
        let msg = "Não é possível excluir este usuário pois ele possui registros vinculados";
        if (procCount) msg += ` (${procCount} processos)`;
        if (auditCount) msg += ` (${auditCount} logs de auditoria)`;
        msg += ". Remova os vínculos antes de excluir o usuário.";
        
        throw new Error(msg);
      }
      throw new Error(`Erro ao deletar: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('Exclusão executada mas nenhum registro foi afetado. ID:', id);
      throw new Error("Permissão negada: O banco de dados (RLS) impediu a exclusão. Verifique se seu nível de acesso permite excluir este perfil.");
    }

    console.log('Perfil deletado com sucesso:', data[0]);
    return data[0];
  },

  async getArbitrosDaOrganizacao(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('org_members')
        .select(`
          user_id,
          perfis ( id, nome, cpf )
        `)
        .eq('organization_id', organizationId)
        .eq('role', 'arbitro');

      if (error) throw error;
      
      // Formatação para facilitar o consumo no frontend
      return data.map((m: any) => ({
        id: m.user_id,
        nome: m.perfis?.nome || 'Árbitro sem nome',
        cpf: m.perfis?.cpf || ''
      }));
    } catch (error: any) {
      console.error('[UserService:getArbitrosDaOrganizacao]', error);
      throw new Error('Falha ao buscar árbitros disponíveis.');
    }
  },
};

import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export const userService = {
  /**
   * Busca perfil do usuário pelo ID.
   */
  getProfile: async (id: string) => {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Busca árbitros disponíveis na câmara.
   */
  getArbitrosDisponiveis: async () => {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('tipo_usuario', 'arbitro');
    if (error) throw error;
    return data;
  },

  /**
   * Atualiza perfil do usuário.
   */
  updateProfile: async (id: string, data: any) => {
    const { error } = await supabase
      .from('perfis')
      .update(data)
      .eq('id', id);
    if (error) throw error;

    await auditService.log('ATUALIZAR_USUARIO', {
      id,
      tabela: 'perfis'
    });
  },

  /**
   * Deleta usuário (Revoga acesso).
   */
  deleteUser: async (id: string) => {
    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('id', id);
    if (error) throw error;

    await auditService.log('DELETAR_USUARIO', {
      id,
      tabela: 'perfis'
    });
  },

  /**
   * Atalho para updateProfile (Retrocompatibilidade).
   */
  update: async (id: string, data: any) => {
    return userService.updateProfile(id, data);
  }
};

export default userService;

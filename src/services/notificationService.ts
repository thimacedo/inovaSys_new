import { supabase } from '../lib/supabase';

export type NotificationType = 'info' | 'sucesso' | 'alerta' | 'erro';

export const notificationService = {
  /**
   * Lista notificações de um usuário.
   */
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Marca uma notificação como lida.
   */
  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Envia uma notificação interna para um usuário específico.
   */
  notify: async (userId: string, data: { titulo: string, mensagem: string, tipo?: NotificationType, processoId?: string }) => {
    const { error } = await supabase.from('notificacoes').insert({
      user_id: userId,
      titulo: data.titulo,
      mensagem: data.mensagem,
      tipo: data.tipo || 'info',
      processo_id: data.processoId,
      lida: false
    });
    if (error) throw error;
  },

  /**
   * Envia uma notificação para todos os administradores de uma organização.
   */
  notifyAdmins: async (orgId: string, data: { titulo: string, mensagem: string, tipo?: NotificationType, processoId?: string }) => {
    const { data: admins, error: aError } = await supabase
      .from('perfis')
      .select('id')
      .eq('organization_id', orgId)
      .in('tipo_usuario', ['admin', 'gestor']);

    if (aError) throw aError;

    if (admins && admins.length > 0) {
      const inserts = admins.map(a => ({
        user_id: a.id,
        titulo: data.titulo,
        mensagem: data.mensagem,
        tipo: data.tipo || 'info',
        processo_id: data.processoId,
        lida: false
      }));

      const { error } = await supabase.from('notificacoes').insert(inserts);
      if (error) throw error;
    }
  }
};

import { supabase } from '../lib/supabase';

export type NotificationType = 'info' | 'sucesso' | 'alerta' | 'erro';

export const notificationService = {
  /**
   * Envia uma notificação interna para um usuário específico.
   */
  notify: async (userId: string, data: {
    titulo: string;
    mensagem: string;
    tipo?: NotificationType;
    processoId?: string;
  }) => {
    const { error } = await supabase.from('notificacoes').insert({
      user_id: userId,
      titulo: data.titulo,
      mensagem: data.mensagem,
      tipo: data.tipo || 'info',
      processo_id: data.processoId,
      lida: false
    });

    if (error) {
      console.error('[NotificationService] Erro ao enviar notificação:', error);
      throw error;
    }
  },

  /**
   * Envia notificação para todos os administradores da organização.
   */
  notifyAdmins: async (orgId: string, data: {
    titulo: string;
    mensagem: string;
    tipo?: NotificationType;
    processoId?: string;
  }) => {
    // Busca IDs dos admins da organização
    const { data: admins } = await supabase
      .from('perfis')
      .select('id')
      .eq('organization_id', orgId)
      .in('tipo_usuario', ['admin', 'gestor', 'god']);

    if (admins) {
      const inserts = admins.map(admin => ({
        user_id: admin.id,
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

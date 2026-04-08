import { supabase } from '../lib/supabase';

export interface Notificacao {
  id: string;
  created_at: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  processo_id?: string;
  lida: boolean;
}

export const notificationService = {
  async getAll(userId: string) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
    return data as Notificacao[];
  },

  async getUnreadCount(userId: string) {
    if (!userId) return 0;
    const { count, error } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);
    
    if (error) {
      console.error('Erro getUnreadCount:', error);
      return 0;
    }
    return count || 0;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', notificationId);
      
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false);
      
    if (error) throw error;
  },

  async notify(userId: string, payload: { tipo: string; titulo: string; mensagem: string; processo_id?: string }) {
    if (!userId) return;
    const { error } = await supabase
      .from('notificacoes')
      .insert([{
        user_id: userId,
        tipo: payload.tipo,
        titulo: payload.titulo,
        mensagem: payload.mensagem,
        processo_id: payload.processo_id,
        lida: false
      }]);
      
    if (error) {
      console.error('Falha ao registrar notificação', error);
      throw error;
    }
  }
};

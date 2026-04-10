import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  created_at: string;
}

type SubscriptionCallback = (notification: Notification) => void;

let channel: RealtimeChannel | null = null;
const callbacks: SubscriptionCallback[] = [];

export const notificationService = {
  /**
   * Busca notificações do usuário atual
   */
  async fetch(userId: string, apenasNaoLidas = false): Promise<Notification[]> {
    let query = supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (apenasNaoLidas) {
      query = query.eq('lida', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Notification[];
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Marca todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false);
    if (error) throw error;
  },

  /**
   * Inscreve-se para receber notificações em tempo real
   */
  subscribe(userId: string, callback: SubscriptionCallback): () => void {
    callbacks.push(callback);

    if (!channel) {
      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            callbacks.forEach((cb) => cb(newNotification));
          }
        )
        .subscribe();
    }

    // Retorna função para remover o callback
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
      if (callbacks.length === 0 && channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  },
};
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface NotificationEntity {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  processo_id?: string;
  lida: boolean;
  created_at?: string;
}

export class NotificationRepository extends BaseSupabaseRepository<NotificationEntity> {
  protected readonly tableName = 'notificacoes';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByUser(userId: string): Promise<NotificationEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotificationEntity[];
    } catch (error) {
      return this.handleError(error, 'listByUser');
    }
  }

  public async markAsRead(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'markAsRead');
    }
  }
}

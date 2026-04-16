import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface MessageEntity {
  id: string;
  processo_id: string;
  autor_id: string;
  autor_nome: string;
  mensagem: string;
  created_at: string;
}

export class MessageRepository extends BaseSupabaseRepository<MessageEntity> {
  protected readonly tableName = 'mensagens_processo';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getByProcesso(processoId: string): Promise<MessageEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return this.handleError(error, 'getByProcesso');
    }
  }

  public subscribeToProcess(processoId: string, callback: (message: MessageEntity) => void) {
    return this.client
      .channel(`processo:${processoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: this.tableName,
          filter: `processo_id=eq.${processoId}`,
        },
        (payload) => {
          callback(payload.new as MessageEntity);
        }
      )
      .subscribe();
  }
}

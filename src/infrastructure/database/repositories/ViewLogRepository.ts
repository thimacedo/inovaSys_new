import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ViewLogEntity {
  id: string;
  usuario_id: string;
  documento_nome: string;
  processo_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface ViewLogWithProfile extends ViewLogEntity {
  perfil: { nome: string; email: string };
}

export class ViewLogRepository extends BaseSupabaseRepository<ViewLogEntity> {
  protected readonly tableName = 'logs_visualizacao';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getByProcesso(processoId: string): Promise<ViewLogWithProfile[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*, perfil:usuario_id (nome, email)')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ViewLogWithProfile[];
    } catch (error) {
      return this.handleError(error, 'getByProcesso');
    }
  }

  public async listAll(limit = 100): Promise<ViewLogWithProfile[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*, perfil:usuario_id (nome, email)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ViewLogWithProfile[];
    } catch (error) {
      return this.handleError(error, 'listAll');
    }
  }
}

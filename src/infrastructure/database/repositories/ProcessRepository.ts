import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ProcessEntity {
  id: string;
  numero_processo?: string;
  status?: string;
  camara_id?: string;
  arbitro_id?: string;
  requerente_id?: string;
  requerido_id?: string;
  [key: string]: any;
}

export class ProcessRepository extends BaseSupabaseRepository<ProcessEntity> {
  protected readonly tableName = 'processos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getById(id: string): Promise<ProcessEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as ProcessEntity;
    } catch (error) {
      return this.handleError(error, 'getById');
    }
  }

  public async listByCamara(camaraId: string): Promise<ProcessEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('camara_id', camaraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProcessEntity[];
    } catch (error) {
      return this.handleError(error, 'listByCamara');
    }
  }
}

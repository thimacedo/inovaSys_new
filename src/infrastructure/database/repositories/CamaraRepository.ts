import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface CamaraEntity {
  id: string;
  nome?: string;
  cnpj?: string;
  signature_provider?: string;
  [key: string]: any;
}

export class CamaraRepository extends BaseSupabaseRepository<CamaraEntity> {
  protected readonly tableName = 'camaras';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getById(id: string): Promise<CamaraEntity | null> {
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

      return data as CamaraEntity;
    } catch (error) {
      return this.handleError(error, 'getById');
    }
  }
}

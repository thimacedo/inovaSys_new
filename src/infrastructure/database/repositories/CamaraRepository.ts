import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { CamaraEntity } from '../../../core/domain/entities/Camara';

export type { CamaraEntity };

export class CamaraRepository extends BaseSupabaseRepository<CamaraEntity> {
  protected readonly tableName = 'camaras';

  constructor(client: SupabaseClient) {
    super(client);
  }

  // Métodos específicos da câmara (ex.: buscar por domínio, etc.)
  async findByDomain(domain: string): Promise<CamaraEntity | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      this.handleError(error, 'findByDomain');
    }
    return data as CamaraEntity;
  }

  async getWithSubscription(id: string): Promise<CamaraEntity | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*, plano:planos(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      this.handleError(error, 'getWithSubscription');
    }
    return data as CamaraEntity;
  }
}

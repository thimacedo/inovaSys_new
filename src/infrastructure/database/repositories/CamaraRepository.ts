import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { CamaraEntity } from '../../../core/domain/entities/Camara';

export class CamaraRepository extends BaseSupabaseRepository<CamaraEntity> {
  constructor(client: SupabaseClient) {
    super(client, 'camaras');
  }

  // Sobrescreve getById para manter compatibilidade com a nova assinatura (T | null)
  async getById(id: string): Promise<CamaraEntity | null> {
    return super.getById(id);
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
      throw error;
    }
    return data as CamaraEntity;
  }
}
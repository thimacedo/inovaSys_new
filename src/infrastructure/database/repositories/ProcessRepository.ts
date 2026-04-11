import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { Processo } from '../../../core/domain/entities/Processo';

export type ProcessEntity = Processo;

export class ProcessRepository extends BaseSupabaseRepository<Processo> {
  protected readonly tableName = 'processos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  // Exemplo: listar processos de uma câmara com dados do árbitro
  async listByCamara(camaraId: string, page = 0, pageSize = 10): Promise<Processo[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*, arbitro:arbitro_id(nome)')
      .eq('camara_id', camaraId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) this.handleError(error, 'listByCamara');
    return (data as Processo[]) || [];
  }

  async listWithPagination(page: number, limit: number): Promise<ProcessEntity[]> {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false });
    if (error) this.handleError(error, 'listWithPagination');
    return (data as ProcessEntity[]) || [];
  }

  async publicSearch(term: string): Promise<ProcessEntity[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .or(`numero.ilike.%${term}%,titulo.ilike.%${term}%`);
    if (error) this.handleError(error, 'publicSearch');
    return (data as ProcessEntity[]) || [];
  }
}

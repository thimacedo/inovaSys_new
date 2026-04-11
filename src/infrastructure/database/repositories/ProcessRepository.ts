import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { Processo } from '../../../core/domain/entities/Processo';

export class ProcessRepository extends BaseSupabaseRepository<Processo> {
  constructor(client: SupabaseClient) {
    super(client, 'processos');
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

    if (error) throw error;
    return (data as Processo[]) || [];
  }
}
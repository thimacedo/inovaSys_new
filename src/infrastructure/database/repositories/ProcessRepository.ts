import { Processo } from '../../../core/domain/entities/Processo';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export type ProcessEntity = Processo;

export class ProcessRepository extends BaseSupabaseRepository<Processo> {
  protected readonly tableName = 'processos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getById(id: string): Promise<ProcessEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*, arbitro:arbitro_id(nome)')
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

  public async listWithPagination(page = 1, pageSize = 10, search = ''): Promise<{ data: ProcessEntity[], count: number | null }> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`numero_processo.ilike.%${search}%,requerente_nome.ilike.%${search}%,requerido_nome.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data as ProcessEntity[], count };
    } catch (error) {
      return this.handleError(error, 'listWithPagination');
    }
  }

  public async publicSearch(searchQuery: string): Promise<ProcessEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('numero_processo', searchQuery)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as ProcessEntity;
    } catch (error) {
      return this.handleError(error, 'publicSearch');
    }
  }
  public async create(data: Omit<ProcessEntity, 'id' | 'created_at' | 'updated_at' | 'numero_processo'>): Promise<ProcessEntity> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert([data])
      .select('*') // Obrigatório para capturar o numero_processo gerado pela Trigger
      .single();

    if (error) {
      console.error('[ProcessRepository] Erro ao criar processo:', error);
      throw error;
    }

    return result as ProcessEntity;
  }
}

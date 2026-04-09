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
  requerente_nome?: string;
  requerido_nome?: string;
  requerente_doc?: string;
  requerido_doc?: string;
  valor_causa?: number;
  created_at?: string;
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
}

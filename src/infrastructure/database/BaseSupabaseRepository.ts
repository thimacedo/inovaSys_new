import { SupabaseClient, PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IRepository, PaginationOptions } from '../../core/domain/IRepository';

export abstract class BaseSupabaseRepository<T, InsertDTO, UpdateDTO> 
  implements IRepository<T, InsertDTO, UpdateDTO> {
  
  protected readonly tableName: string;
  protected readonly client: SupabaseClient;
  private static currentOrgId: string | null = null;

  constructor(tableName: string, client: SupabaseClient) {
    this.tableName = tableName;
    this.client = client;
  }

  /**
   * Define o org_id global para ser injetado em todas as inserções.
   * Deve ser chamado após o login/carregamento do perfil.
   */
  public static setOrgId(id: string | null): void {
    this.currentOrgId = id;
  }

  protected handlePostgrestError(error: PostgrestError): void {
    if (error.code === 'PGRST116') {
      return;
    }
    throw new Error(`Database Error [${this.tableName}]: Code ${error.code} - ${error.message}`);
  }

  /**
   * Executes a query that returns a single result.
   * Hardened type handling to ensure consistency.
   */
  protected async executeSingleQuery(query: PromiseLike<PostgrestSingleResponse<any>>): Promise<T | null> {
    const { data, error } = await query;
    
    if (error) {
      this.handlePostgrestError(error);
      return null;
    }

    return (data as T) || null;
  }

  public async findById(id: string): Promise<T | null> {
    const query = this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeSingleQuery(query);
  }

  public async findAll(options?: PaginationOptions): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');

    if (options?.limit !== undefined) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      this.handlePostgrestError(error);
    }

    return (data || []) as T[];
  }

  /**
   * Busca todos os registros com suporte a paginação e contagem total.
   */
  public async findAllWithCount(options?: PaginationOptions): Promise<{ data: T[], count: number }> {
    let query = this.client.from(this.tableName).select('*', { count: 'exact' });

    if (options?.limit !== undefined) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handlePostgrestError(error);
    }

    return {
      data: (data || []) as T[],
      count: count || 0
    };
  }

  public async create(data: InsertDTO): Promise<T> {
    // Injeção automática de org_id se disponível e não fornecido
    const payload = { ...data } as any;
    if (!payload.org_id && BaseSupabaseRepository.currentOrgId) {
      payload.org_id = BaseSupabaseRepository.currentOrgId;
    }

    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert([payload])
      .select()
      .single();

    if (error) {
      this.handlePostgrestError(error);
    }

    return result as T;
  }

  public async update(id: string, data: UpdateDTO): Promise<T | null> {
    const query = this.client
      .from(this.tableName)
      .update(data as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    return this.executeSingleQuery(query);
  }

  public async delete(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from(this.tableName)
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      this.handlePostgrestError(error);
      return false;
    }

    return count !== null && count > 0;
  }
}

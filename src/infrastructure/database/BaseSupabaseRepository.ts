import { SupabaseClient } from '@supabase/supabase-js';
import { logAudit } from '../../services/auditoriaService';

export abstract class BaseSupabaseRepository<T> {
  protected readonly client: SupabaseClient;
  protected abstract readonly tableName: string;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  protected async handleError(error: any, context: string): Promise<never> {
    console.error(`[SupabaseRepositoryError] - ${context}:`, error);
    throw error;
  }

  public async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      
      // Registro de Auditoria assíncrono (não bloqueante)
      logAudit('create', this.tableName, (result as any).id, undefined, data).catch(() => {});

      return result as T;
    } catch (error) {
       return this.handleError(error, 'create');
    }
  }

  public async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logAudit('update', this.tableName, id, undefined, data).catch(() => {});

      return result as T;
    } catch (error) {
       return this.handleError(error, 'update');
    }
  }

  public async getById(id: string): Promise<T> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as T;
    } catch (error) {
      return this.handleError(error, 'getById');
    }
  }

  public async list(page: number = 0, pageSize: number = 10): Promise<T[]> {
    try {
      const start = page * pageSize;
      const end = start + pageSize - 1;

      const { data, error } = await this.client
        .from(this.tableName)
        .select()
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return data as T[];
    } catch (error) {
      return this.handleError(error, 'list');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      logAudit('delete', this.tableName, id).catch(() => {});
    } catch (error) {
      return this.handleError(error, 'delete');
    }
  }
}

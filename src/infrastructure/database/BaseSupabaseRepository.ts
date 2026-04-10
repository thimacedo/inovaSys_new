import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseSupabaseRepository<T> {
  protected readonly client: SupabaseClient;
  protected abstract readonly tableName: string;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  protected async handleError(error: any, context: string): Promise<never> {
    console.error(`[SupabaseRepositoryError] - ${context}:`, error);
    throw new Error(`Falha na operação de banco de dados: ${error.message || 'Erro desconhecido'}`);
  }

  public async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      return this.handleError(error, 'create');
    }
  }

  public async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      return this.handleError(error, 'update');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'delete');
    }
  }
}

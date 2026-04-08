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
}

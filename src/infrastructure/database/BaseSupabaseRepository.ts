import { SupabaseClient } from '@supabase/supabase-js';
import { logAudit } from '../../services/auditoriaService';

export abstract class BaseSupabaseRepository<T extends { id: string }> {
  protected abstract readonly tableName: string;

  constructor(protected client: SupabaseClient) {}

  /**
   * Manipulador de erros padrão para operações de banco de dados
   * @param error Erro capturado da operação Supabase
   * @param context Contexto da operação (create, update, delete, getById, list)
   * @throws Error formatado com mensagem amigável
   * @returns never - essa função NUNCA retorna, sempre lança exceção
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[SupabaseRepositoryError] - ${context}:`, error);
    throw new Error(`Falha na operação de banco de dados: ${message}`);
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Código PGRST116 indica que nenhum registro foi encontrado (single() com 0 resultados)
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'getById');
    }
    return data as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert([data as any])
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    await logAudit('create', this.tableName, result.id, undefined, data);
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error(`Registro não encontrado para id ${id}`);
    }

    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'update');
    await logAudit('update', this.tableName, id, oldData, data);
    return result as T;
  }

  async delete(id: string): Promise<void> {
    const oldData = await this.getById(id);
    if (!oldData) {
      throw new Error(`Registro não encontrado para id ${id}`);
    }

    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'delete');
    await logAudit('delete', this.tableName, id, oldData, undefined);
  }

  async list(page = 0, pageSize = 10): Promise<T[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) this.handleError(error, 'list');
    return (data as T[]) || [];
  }
}
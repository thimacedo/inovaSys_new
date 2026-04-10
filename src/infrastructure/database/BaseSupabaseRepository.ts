import { SupabaseClient } from '@supabase/supabase-js';
import { logAudit } from '../../services/auditoriaService';

export class BaseSupabaseRepository<T extends { id: string }> {
  constructor(
    protected client: SupabaseClient,
    protected tableName: string
  ) {}

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert([data as any])
      .select()
      .single();

    if (error) throw error;
    await logAudit('create', this.tableName, result.id, undefined, data);
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const oldData = await this.getById(id);
    if (!oldData) throw new Error('Registro nÃ£o encontrado');

    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAudit('update', this.tableName, id, oldData, data);
    return result as T;
  }

  async delete(id: string): Promise<void> {
    const oldData = await this.getById(id);
    if (!oldData) throw new Error('Registro nÃ£o encontrado');

    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
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

    if (error) throw error;
    return (data as T[]) || [];
  }
}

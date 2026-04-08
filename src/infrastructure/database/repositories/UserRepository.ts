import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface UserEntity {
  id: string;
  email?: string;
  nome?: string;
  tipo_usuario?: string;
  camara_id?: string;
  organization_id?: string;
}

export class UserRepository extends BaseSupabaseRepository<UserEntity> {
  protected readonly tableName = 'perfis';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getById(id: string): Promise<UserEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return data as UserEntity;
    } catch (error) {
      return this.handleError(error, 'getById');
    }
  }

  public async getByEmail(email: string): Promise<UserEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return data as UserEntity;
    } catch (error) {
      return this.handleError(error, 'getByEmail');
    }
  }
}

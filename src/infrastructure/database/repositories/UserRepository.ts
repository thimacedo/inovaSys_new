import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { Usuario } from '../../../core/domain/entities/Usuario';

export type UserEntity = Usuario;

export class UserRepository extends BaseSupabaseRepository<Usuario> {
  protected readonly tableName = 'usuarios';

  constructor(client: SupabaseClient) {
    super(client);
  }

  // Exemplo: buscar usuário por email
  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      this.handleError(error, 'findByEmail');
    }
    return data as Usuario;
  }

  async listAll(): Promise<UserEntity[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*');
    if (error) this.handleError(error, 'listAll');
    return (data as UserEntity[]) || [];
  }

  async listAllArbitros(): Promise<UserEntity[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('role', 'arbitro');
    if (error) this.handleError(error, 'listAllArbitros');
    return (data as UserEntity[]) || [];
  }
}

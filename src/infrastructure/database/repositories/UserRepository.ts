import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { Usuario } from '../../../core/domain/entities/Usuario';

export class UserRepository extends BaseSupabaseRepository<Usuario> {
  constructor(client: SupabaseClient) {
    super(client, 'usuarios');
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
      throw error;
    }
    return data as Usuario;
  }
}
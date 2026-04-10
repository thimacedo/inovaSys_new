import { Usuario } from '../../../core/domain/entities/Usuario';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export type UserEntity = Usuario;

export class UserRepository extends BaseSupabaseRepository<Usuario> {
  protected readonly tableName = 'perfis';

  constructor(client: SupabaseClient) {
    super(client);
  }

  /**
   * Lista todos os usuários (com paginação/ordenação básica do base)
   */
  public async listAll(limit = 100) {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as UserEntity[];
  }

  /**
   * Lista TODOS os árbitros do sistema (correção: não filtra mais por organização)
   * Qualquer árbitro cadastrado aparece imediatamente para atribuição em qualquer processo
   */
  public async listAllArbitros() {
    const { data, error } = await this.client
      .from('perfis')
      .select(`id, nome, cpf, email`)
      .in('tipo_usuario', ['arbitro', 'Árbitro', 'Arbitro', 'ARBITRO'])
      .order('nome', { ascending: true });

    if (error) throw error;
    return data;
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as UserEntity;
  }

  /**
   * Sobrescrita do getById para incluir tratamento de erro unificado
   */
  public async getById(id: string): Promise<UserEntity | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as UserEntity;
  }
}

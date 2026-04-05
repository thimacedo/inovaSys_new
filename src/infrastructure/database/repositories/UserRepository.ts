import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';

export interface UserEntity {
  id: string;
  email: string;
  org_id?: string;
  created_at: string;
}

export type UserInsertDTO = Omit<UserEntity, 'id' | 'created_at'>;
export type UserUpdateDTO = Partial<UserInsertDTO>;

export class UserRepository extends BaseSupabaseRepository<UserEntity, UserInsertDTO, UserUpdateDTO> {
  constructor(client: SupabaseClient) {
    super('perfis', client);
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const query = this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    return this.executeSingleQuery(query);
  }
}

import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserEntity } from './UserRepository';

export class TeamRepository extends BaseSupabaseRepository<UserEntity> {
  protected readonly tableName = 'perfis';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByOrganization(organizationId: string): Promise<UserEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .or(`organization_id.eq.${organizationId},camara_id.eq.${organizationId}`)
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as UserEntity[];
    } catch (error) {
      return this.handleError(error, 'listByOrganization');
    }
  }

  public async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .update({ tipo_usuario: newRole })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'updateUserRole');
    }
  }

  public async removeUserFromOrganization(userId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .update({ organization_id: null, camara_id: null, tipo_usuario: 'usuario' })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'removeUserFromOrganization');
    }
  }
}

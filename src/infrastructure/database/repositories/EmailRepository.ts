import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { EmailTemplate } from '../../../core/domain/entities/EmailTemplate';
import { SupabaseClient } from '@supabase/supabase-js';

export class EmailRepository extends BaseSupabaseRepository<EmailTemplate> {
  protected readonly tableName: string = 'email_templates';

  constructor(client: SupabaseClient) {
    super(client);
  }

  // Métodos específicos para templates de e-mail podem ser adicionados aqui.
  // Por exemplo, buscar um template pelo nome:
  public async getTemplateByName(name: string, orgId: string): Promise<EmailTemplate | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('name', name)
      .eq('organization_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
      return this.handleError(error, 'getTemplateByName');
    }

    return data;
  }
}

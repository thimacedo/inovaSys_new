import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface TemplateEntity {
  id: string;
  organization_id?: string;
  nome: string;
  tipo_documento: number;
  conteudo_html: string;
}

export class TemplateRepository extends BaseSupabaseRepository<TemplateEntity> {
  protected readonly tableName = 'templates_documentos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async getByType(tipoDocumento: number): Promise<TemplateEntity | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('tipo_documento', tipoDocumento)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as TemplateEntity;
    } catch (error) {
      return this.handleError(error, 'getByType');
    }
  }
}

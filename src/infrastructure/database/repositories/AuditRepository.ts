import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditEntity {
  id: string;
  usuario_id: string;
  acao: string;
  tabela: string;
  registro_id: string;
  dados_antigos?: any;
  dados_novos?: any;
  ip_address?: string;
  created_at: string;
}

export interface AuditWithProfile extends AuditEntity {
  perfil: { nome: string; email: string };
}

export class AuditRepository extends BaseSupabaseRepository<AuditEntity> {
  protected readonly tableName = 'auditoria';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listAll(limit = 100): Promise<AuditWithProfile[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*, perfil:usuario_id (nome, email)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AuditWithProfile[];
    } catch (error) {
      return this.handleError(error, 'listAll');
    }
  }
}

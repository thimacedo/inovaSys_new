import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';

export interface ProcessEntity {
  id: string;
  numero_processo: string;
  requerente_nome: string;
  requerente_doc: string;
  requerente_end?: string;
  requerido_nome?: string;
  requerido_doc?: string;
  requerido_end?: string;
  status: string;
  valor_causa: number;
  resumo_fatos?: string;
  created_at: string;
  user_id: string;
  camara_id?: string;
  org_id?: string; // Adicionado org_id conforme nova arquitetura
  arbitro_id?: string;
}

export type ProcessInsertDTO = Omit<ProcessEntity, 'id' | 'created_at'>;
export type ProcessUpdateDTO = Partial<ProcessInsertDTO>;

export class ProcessRepository extends BaseSupabaseRepository<ProcessEntity, ProcessInsertDTO, ProcessUpdateDTO> {
  constructor(client: SupabaseClient) {
    super('processos', client);
  }

  // Adicionar método de exclusão respeitando o contrato de segurança
  public async delete(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from(this.tableName)
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      this.handlePostgrestError(error);
      return false;
    }

    // Se count for 0, o RLS impediu a deleção (usuário não é admin/owner ou ID não existe)
    return count !== null && count > 0;
  }
}

import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface HistoryEntity {
  id: string;
  processo_id: string;
  tipo: 'sistema' | 'usuario' | 'externo';
  titulo: string;
  descricao?: string;
  autor_id?: string;
  metadata?: any;
  created_at: string;
}

export interface HistoryWithProfile extends HistoryEntity {
  perfil: { nome: string; email: string };
}

export class HistoryRepository extends BaseSupabaseRepository<HistoryEntity> {
  protected readonly tableName = 'historico_processos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByProcesso(processoId: string): Promise<HistoryWithProfile[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*, perfis:autor_id (nome, email)')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HistoryWithProfile[];
    } catch (error) {
      return this.handleError(error, 'listByProcesso');
    }
  }

  public async addEntry(processoId: string, titulo: string, tipo: HistoryEntity['tipo'], descricao?: string, autorId?: string, metadata?: any): Promise<HistoryEntity> {
    return await this.create({
      processo_id: processoId,
      titulo,
      tipo,
      descricao,
      autor_id: autorId,
      metadata
    });
  }
}

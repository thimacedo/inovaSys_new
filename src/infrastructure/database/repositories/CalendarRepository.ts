import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface CalendarEvent {
  id: string;
  processo_id?: string;
  camara_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'Audiencia' | 'Reuniao' | 'Sessao' | 'Outro';
  local?: string;
  link_reuniao?: string;
}

export class CalendarRepository extends BaseSupabaseRepository<CalendarEvent> {
  protected readonly tableName = 'agenda';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByCamara(camaraId: string, start: string, end: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('camara_id', camaraId)
        .gte('data_inicio', start)
        .lte('data_inicio', end)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    } catch (error) {
      return this.handleError(error, 'listByCamara');
    }
  }
}

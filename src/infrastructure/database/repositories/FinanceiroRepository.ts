import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface FinanceiroEntity {
  id: string;
  organization_id: string;
  processo_id?: string;
  descricao: string;
  valor: number;
  tipo: 'Custa' | 'Hon_Arbitral' | 'Hon_Sucumbencia' | 'Outros' | 'Outro';
  status: 'Pendente' | 'Pago' | 'Cancelado';
  data_vencimento?: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  comprovante_url?: string;
  [key: string]: any;
}

export class FinanceiroRepository extends BaseSupabaseRepository<FinanceiroEntity> {
  protected readonly tableName = 'financeiro';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByOrganization(organizationId: string): Promise<FinanceiroEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(`
          *,
          processos:processo_id (numero_processo)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinanceiroEntity[];
    } catch (error) {
      return this.handleError(error, 'listByOrganization');
    }
  }

  public async listByProcesso(processoId: string): Promise<FinanceiroEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinanceiroEntity[];
    } catch (error) {
      return this.handleError(error, 'listByProcesso');
    }
  }
}

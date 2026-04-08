import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from '../BaseSupabaseRepository';

export interface CamaraEntity {
  id: string;
  nome: string;
  cnpj: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  endereco?: string;
  fone?: string;
  presidente_nome?: string;
  logo?: string;
  webhook_url?: string;
  webhook_token?: string;
  organization_id: string;
  created_at: string;
}

export type CamaraInsertDTO = Omit<CamaraEntity, 'id' | 'created_at'>;
export type CamaraUpdateDTO = Partial<CamaraInsertDTO>;

export class CamaraRepository extends BaseSupabaseRepository<CamaraEntity, CamaraInsertDTO, CamaraUpdateDTO> {
  constructor(client: SupabaseClient) {
    super('camaras', client);
  }
}

export interface Financeiro {
  id: string;
  organization_id: string;
  camara_id?: string; // Mapeado em faturas_pix
  processo_id?: string;
  descricao: string;
  valor: number;
  tipo: 'Custa' | 'Hon_Arbitral' | 'Hon_Sucumbencia' | 'Outros' | 'Outro';
  status: 'Pendente' | 'Pago' | 'Expirado' | 'Cancelado';
  data_vencimento?: string;
  data_pagamento?: string;
  pago_at?: string; // Mapeado em faturas_pix
  pix_payload?: string | null;
  metodo_pagamento?: string;
  comprovante_url?: string;
  validado_por?: string | null;
  perfil_id?: string; // Alias legado para logs
  created_at: string;
  criado_at?: string; // Mapeado em faturas_pix
  updated_at?: string;
}

export interface Financeiro {
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
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

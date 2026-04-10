export interface Processo {
  id: string;
  numero_processo?: string;
  status?: string;
  camara_id?: string;
  organization_id?: string;
  arbitro_id?: string;
  requerente_id?: string;
  requerido_id?: string;
  requerente_nome?: string;
  requerido_nome?: string;
  requerente_doc?: string;
  requerido_doc?: string;
  valor_causa?: number;
  resumo_fatos?: string;
  created_at?: string;
  updated_at?: string;
  arbitro?: { nome: string };
  [key: string]: any;
}

export interface Processo {
  id: string;
  numero_processo: string;
  numero_processo_judicial?: string;
  status?: string;
  camara_id?: string | null;
  organization_id?: string | null;
  arbitro_id?: string | null;
  requerente_id?: string;
  requerido_id?: string;
  requerente_nome: string;
  requerido_nome: string;
  requerente_documento?: string | null;
  requerido_documento?: string | null;
  requerente_doc?: string | null; // Alias legado
  requerido_doc?: string | null;  // Alias legado
  requerente_endereco?: string | null;
  requerido_endereco?: string | null;
  requerente_end?: string | null; // Alias legado
  requerido_end?: string | null;  // Alias legado
  valor_causa: number;
  resumo_fatos: string | null;
  sentenca_texto?: string | null;
  autor_id?: string | null; // Alias legado para user_id
  user_id?: string | null;
  created_at: string;
  updated_at: string;
  arbitro?: { nome: string };
}

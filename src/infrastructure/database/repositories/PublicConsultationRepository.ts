import { SupabaseClient } from '@supabase/supabase-js';

export interface PublicSentenceResult {
  numero_processo: string;
  requerente_nome: string;
  requerido_nome: string;
  status: string;
  data_conclusao: string;
  conteudo_html: string;
  assinado_por: string;
  hash_validacao: string;
  error?: string;
}

export class PublicConsultationRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  public async consultarSentenca(numeroProcesso: string, codigoValidacao: string): Promise<PublicSentenceResult> {
    const { data, error } = await this.client.rpc('consultar_sentenca_publica', {
      p_numero_processo: numeroProcesso,
      p_codigo_validacao: codigoValidacao,
    });

    if (error) {
      console.error('[PublicConsultationRepository] Erro na RPC:', error);
      throw error;
    }

    return data as PublicSentenceResult;
  }
}

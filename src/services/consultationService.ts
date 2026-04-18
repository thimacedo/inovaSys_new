import { supabase } from '../lib/supabase';

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

export const consultationService = {
  async querySentence(numeroProcesso: string, codigoValidacao: string): Promise<PublicSentenceResult> {
    const { data, error } = await supabase.rpc('consultar_sentenca_publica', {
      p_numero_processo: numeroProcesso,
      p_codigo_validacao: codigoValidacao,
    });

    if (error) {
      console.error('[ConsultationService] Erro na RPC:', error);
      throw error;
    }

    return data as PublicSentenceResult;
  }
};

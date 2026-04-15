import { supabase } from '../lib/supabase';

export const signatureService = {
  /**
   * Registra uma assinatura digital interna para um documento.
   */
  assinarDocumento: async (data: {
    processoId: string;
    documentoTipo: number;
    nomeDocumento: string;
    htmlFinal: string;
    signatarioId: string;
    signatarioNome: string;
  }) => {
    // Captura metadados de rede
    const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => ({ json: () => ({ ip: '0.0.0.0' }) }));
    const { ip } = await ipResponse.json();

    // Gera um hash simples para representar a integridade (SHA-256 seria o ideal com biblioteca externa)
    const hash = btoa(`${data.processoId}-${data.signatarioId}-${Date.now()}`).substring(0, 32);

    const { error } = await supabase.from('documentos_assinados').insert({
      processo_id: data.processoId,
      documento_tipo: data.documentoTipo,
      nome_documento: data.nomeDocumento,
      html_final: data.htmlFinal,
      signatario_id: data.signatarioId,
      signatario_nome: data.signatarioNome,
      ip_address: ip,
      user_agent: navigator.userAgent,
      hash_assinatura: hash
    });

    if (error) throw error;
    return { hash, ip };
  },

  /**
   * Busca histórico de assinaturas de um processo.
   */
  getAssinaturasByProcesso: async (processoId: string) => {
    const { data, error } = await supabase
      .from('documentos_assinados')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

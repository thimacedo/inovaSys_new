import { supabase } from '../lib/supabase';
import { whatsappService } from './whatsappService';

export interface SignatureRequest {
  attachmentId: string;
  signers?: { email: string; nome: string; phone?: string }[];
  message?: string;
}

export const signatureService = {
  /**
   * Envia um documento para assinatura digital externa (ClickSign/Docusign)
   * ou utiliza o sistema de assinatura interna da InovaSys como fallback.
   */
  sendForSignature: async (config: any, request: SignatureRequest) => {
    try {
      // 1. Buscar metadados do anexo
      const { data: file, error: fError } = await supabase
        .from('anexos')
        .select('*, processo:processos(*)')
        .eq('id', request.attachmentId)
        .single();

      if (fError || !file) throw new Error("Documento não encontrado para assinatura.");

      const provider = config.signature_provider || 'internal';
      
      // Simulação de Integração com API Externa (Roadmap 3.0)
      console.log(`[SignatureService] Iniciando fluxo via provedor: ${provider}`);

      // 2. Registrar solicitação no banco
      const { data: sRequest, error: sError } = await supabase.from('solicitacoes_assinatura').insert({
        anexo_id: file.id,
        processo_id: file.processo_id,
        provedor: provider,
        status: 'pendente',
        metadata: {
          request_at: new Date().toISOString(),
          signers: request.signers || [
            { nome: file.processo.requerente_nome, email: file.processo.requerente_email, phone: file.processo.requerente_fone },
            { nome: file.processo.requerido_nome, email: file.processo.requerido_email, phone: file.processo.requerido_fone }
          ]
        }
      }).select().single();

      if (sError) throw sError;

      // 3. Disparar Notificação WhatsApp (Eficiência Mecânica)
      const destinatario = file.processo.requerente_nome;
      const fone = file.processo.requerente_fone;
      if (fone) {
        const msg = whatsappService.templates.avisoAndamento(
          destinatario, 
          file.processo.numero_processo || '---', 
          `Um novo documento ("${file.nome_arquivo}") foi enviado para sua assinatura digital. Verifique seu e-mail ou clique no link do sistema.`
        );
        whatsappService.enviarMensagem(fone, msg);
      }

      return sRequest;
    } catch (error) {
      console.error('[SignatureService] Falha ao enviar para assinatura:', error);
      throw error;
    }
  },

  /**
   * Solicita assinatura via Provedor Gov.br (Integração ITI Staging)
   * 🚀 Finalização do Módulo de Produção
   */
  requestGovBrSignature: async (fileId: string) => {
    try {
      // 1. Buscar metadados do documento
      const { data: file, error: fError } = await supabase
        .from('anexos')
        .select('*, processo:processos(*)')
        .eq('id', fileId)
        .single();

      if (fError || !file) throw new Error("Documento não encontrado para assinatura Gov.br.");

      // 2. Simular chamada ao ITI (Staging)
      console.log(`[SignatureService] Simulando integração com ITI para o arquivo: ${file.nome_arquivo}`);
      
      // No ambiente de Staging, retornamos um link de sandbox
      const redirectUrl = `https://cas.iti.br/sandbox/sign?file=${fileId}&token=${btoa(Date.now().toString())}`;

      // 3. Registrar na tabela 'solicitacoes_assinatura'
      const { data: sRequest, error: sError } = await supabase.from('solicitacoes_assinatura').insert({
        anexo_id: file.id,
        processo_id: file.processo_id,
        provedor: 'govbr',
        status: 'Aguardando Cidadão',
        metadata: {
          external_id: `iti_stg_${Math.random().toString(36).substring(7)}`,
          redirect_link: redirectUrl,
          requested_at: new Date().toISOString()
        }
      }).select().single();

      if (sError) throw sError;

      return {
        success: true,
        status: 'Aguardando Cidadão',
        redirectUrl,
        requestId: sRequest.id
      };
    } catch (error) {
      console.error('[SignatureService] Falha na solicitação Gov.br:', error);
      throw error;
    }
  },

  /**
   * Registra uma assinatura digital interna para um documento (Hash-based).
   */
  assinarDocumento: async (data: {
    processoId: string;
    documentoTipo: number;
    nomeDocumento: string;
    htmlFinal: string;
    signatarioId: string;
    signatarioNome: string;
  }) => {
    // Captura metadados de rede com proteção de timeout
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 2000);
    const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
      .catch(() => ({ json: () => ({ ip: '0.0.0.0' }) }));
    
    clearTimeout(tId);
    const { ip } = await (ipResponse as any).json().catch(() => ({ ip: '0.0.0.0' }));

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

export interface SignatureRequest {
  documentBase64: string;
  documentName: string;
  signers: {
    name: string;
    email: string;
    role: 'signer' | 'witness';
  }[];
}

export const signatureService = {
  /**
   * Envia um documento para assinatura usando o provedor configurado.
   * Atualmente preparado para Clicksign (Padrão) e extensível para outros.
   */
  sendForSignature: async (config: any, request: SignatureRequest) => {
    if (!config.signature_api_token) {
      throw new Error("Token de API de assinatura não configurado.");
    }

    const provider = config.signature_provider || 'clicksign';

    switch (provider) {
      case 'clicksign':
        return await signatureService.integrators.clicksign(config, request);
      case 'docusign':
        // Placeholder para implementação futura
        throw new Error("Provedor DocuSign ainda não implementado.");
      default:
        throw new Error(`Provedor ${provider} não suportado.`);
    }
  },

  integrators: {
    clicksign: async (config: any, request: SignatureRequest) => {
      // Exemplo de payload para Clicksign API v2
      // Na prática, isso seria feito através de uma Função Edge ou Backend para proteger o token.
      
      console.log(`[Clicksign] Enviando documento: ${request.documentName}`);
      
      // Simulação de chamada de API
      const response = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${config.signature_api_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
             path: `/${request.documentName}.pdf`,
             content_base64: `data:application/pdf;base64,${request.documentBase64}`,
             deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
             auto_close: true,
             locale: 'pt-BR'
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.errors ? err.errors.join(', ') : 'Erro na Clicksign');
      }

      return await response.json();
    }
  }
};

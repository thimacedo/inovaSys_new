export interface Signer {
  name: string;
  email: string;
  documentation: string;
  birthday?: string;
  phone?: string;
}

export interface SignatureRequest {
  documentKey?: string;          // chave do documento já existente (opcional)
  documentBase64?: string;       // conteúdo em base64 (opcional)
  documentName?: string;         // nome do documento (opcional)
  signers: Signer[];
  message?: string;
  urlAccess?: boolean;
  apiToken: string;
}

export interface SignatureResponse {
  success: boolean;
  envelopeKey: string;
  statusUrl: string;
}

export const signatureService = {
  async createEnvelope(request: SignatureRequest): Promise<SignatureResponse> {
    const response = await fetch('/api/click/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao criar envelope');
    }

    return response.json();
  },
};
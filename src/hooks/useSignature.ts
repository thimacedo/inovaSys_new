import { useState } from 'react';
import { signatureService, SignatureRequest } from '../services/signatureService';

export function useSignature() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envelopeData, setEnvelopeData] = useState<{ envelopeKey: string; statusUrl: string } | null>(null);

  const sendForSignature = async (request: SignatureRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signatureService.createEnvelope(request);
      setEnvelopeData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, envelopeData, sendForSignature };
}
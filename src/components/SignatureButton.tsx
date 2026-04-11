import React from 'react';
import { useSignature } from '../hooks/useSignature';
import { Loader2, FileSignature } from 'lucide-react';

interface SignatureButtonProps {
  documentKey: string;
  signers: Array<{ name: string; email: string; documentation: string }>;
  apiToken: string;
  onSuccess?: (envelopeKey: string) => void;
  disabled?: boolean;
}

export const SignatureButton: React.FC<SignatureButtonProps> = ({
  documentKey,
  signers,
  apiToken,
  onSuccess,
  disabled = false,
}) => {
  const { loading, error, sendForSignature } = useSignature();

  const handleClick = async () => {
    const result = await sendForSignature({
      documentKey,
      signers,
      apiToken,
      message: 'Documento gerado pelo InovaSys. Assinatura necessária.',
    });
    if (result?.success) {
      onSuccess?.(result.envelopeKey);
      window.open(result.statusUrl, '_blank');
    }
  };

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
        {loading ? 'Enviando...' : 'Enviar para Assinatura'}
      </button>
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
};
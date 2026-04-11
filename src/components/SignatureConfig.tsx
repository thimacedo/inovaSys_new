import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Key, Loader2 } from 'lucide-react';

interface SignatureConfigProps {
  camaraId: string;
  currentToken?: string;
  onSaved?: () => void;
}

export const SignatureConfig: React.FC<SignatureConfigProps> = ({
  camaraId,
  currentToken = '',
  onSaved,
}) => {
  const [token, setToken] = useState(currentToken);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('camaras')
        .update({ signature_api_token: token })
        .eq('id', camaraId);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Token salvo com sucesso!' });
      onSaved?.();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar token' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Configuração Clicksign</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Insira o token de API da Clicksign para esta câmara.
      </p>
      <div className="space-y-3">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token da API Clicksign"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Token
          </button>
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
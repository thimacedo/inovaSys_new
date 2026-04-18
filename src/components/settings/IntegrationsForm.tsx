import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface IntegrationsFormProps {
  webhookUrl: string;
  webhookToken: string;
  onChange: (field: string, val: string) => void;
  onTest: () => void;
  testing: boolean;
}

export const IntegrationsForm: React.FC<IntegrationsFormProps> = ({
  webhookUrl,
  webhookToken,
  onChange,
  onTest,
  testing
}) => {
  return (
    <MD3Card variant="filled" className="!p-8 md:!p-10 space-y-8">
      <div className="flex items-center gap-4 text-md-on-surface font-bold text-xl tracking-tight">
        <div className="p-3 bg-md-secondary/10 text-md-secondary rounded-2xl">
          <Zap size={24} />
        </div>
        <h4>Conectividade e Webhooks</h4>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">URL de Destino</label>
          <div className="flex gap-3">
            <input 
              type="url" 
              className="flex-1 h-14 w-full bg-md-surface-variant rounded-t-xl border-b-2 border-md-outline px-4 text-md-on-surface transition-colors duration-200 focus:border-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50 shadow-sm" 
              placeholder="https://sua-api.com/webhook" 
              value={webhookUrl} 
              onChange={e => onChange('webhook_url', e.target.value)} 
            />
            <button 
              type="button" 
              disabled={testing} 
              onClick={onTest} 
              className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-secondary-container text-md-on-secondary-container hover:shadow-sm !px-8 shadow-sm"
            >
              {testing ? <Loader2 className="animate-spin" size={18} /> : 'Testar'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">Token de Autorização (Bearer)</label>
          <input 
            type="text" 
            className="w-full h-14 w-full bg-md-surface-variant rounded-t-xl border-b-2 border-md-outline px-4 text-md-on-surface transition-colors duration-200 focus:border-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50 shadow-sm" 
            placeholder="Chave secreta de integração" 
            value={webhookToken} 
            onChange={e => onChange('webhook_token', e.target.value)} 
          />
        </div>
      </div>
    </MD3Card>
  );
};

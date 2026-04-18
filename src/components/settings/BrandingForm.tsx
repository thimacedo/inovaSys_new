import React from 'react';
import { ImageIcon, UploadCloud } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface BrandingFormProps {
  logo: string;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BrandingForm: React.FC<BrandingFormProps> = ({ logo, onLogoChange }) => {
  return (
    <MD3Card variant="filled" className="!p-8 md:!p-10 space-y-10 !bg-md-tertiary-container/10">
      <div className="flex items-center gap-4 text-md-on-surface font-bold text-xl tracking-tight">
        <div className="p-3 bg-md-tertiary/10 text-md-tertiary rounded-2xl">
          <ImageIcon size={24} />
        </div>
        <h4>Identidade Visual</h4>
      </div>
      
      <div className="flex flex-col xl:flex-row items-center gap-12">
        <div className="flex-1 space-y-4">
          <p className="text-sm text-md-on-surface-variant font-medium leading-relaxed">Personalize a logomarca da sua Câmara. Recomendamos arquivos PNG ou SVG com fundo transparente para melhor aplicação nos documentos oficiais.</p>
          <input type="file" id="logo-upload-md" className="hidden" accept="image/*" onChange={onLogoChange} />
          <label 
            htmlFor="logo-upload-md" 
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-md-outline/20 rounded-[32px] bg-md-surface hover:border-md-primary hover:bg-md-primary/5 transition-all cursor-pointer group shadow-sm"
          >
            <UploadCloud className="text-md-on-surface-variant/30 group-hover:text-md-primary mb-3 transition-colors" size={40} />
            <span className="text-xs font-black text-md-on-surface-variant uppercase tracking-widest">Atualizar Identidade</span>
          </label>
        </div>
        
        <div className="w-56 h-56 bg-md-surface border border-md-outline/10 rounded-[40px] flex items-center justify-center p-6 shadow-md relative overflow-hidden group">
          {logo ? (
            <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <ImageIcon size={48} className="text-md-on-surface-variant/10" />
          )}
        </div>
      </div>
    </MD3Card>
  );
};

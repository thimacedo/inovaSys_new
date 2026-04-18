import React from 'react';
import { Building2, Fingerprint, User, Phone, MapPin } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface InstitutionInfoFormProps {
  data: any;
  onChange: (field: string, val: string) => void;
}

export const InstitutionInfoForm: React.FC<InstitutionInfoFormProps> = ({ data, onChange }) => {
  return (
    <MD3Card variant="filled" className="!p-8 md:!p-10 space-y-10">
      <div className="flex items-center gap-4 text-md-on-surface font-bold text-xl tracking-tight">
        <div className="p-3 bg-md-primary/10 text-md-primary rounded-2xl">
          <Building2 size={24} />
        </div>
        <h4>Dados Institucionais</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">Razão Social / Nome</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              className="input-md !pl-12 shadow-sm" 
              value={data.nome} 
              onChange={e => onChange('nome', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">CNPJ Oficial</label>
          <div className="relative">
            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              className="input-md !pl-12 shadow-sm" 
              value={data.cnpj} 
              onChange={e => onChange('cnpj', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">Presidente em Exercício</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              className="input-md !pl-12 shadow-sm" 
              value={data.presidente_nome} 
              onChange={e => onChange('presidente_nome', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">Contato Telefônico</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              className="input-md !pl-12 shadow-sm" 
              value={data.fone} 
              onChange={e => onChange('fone', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] ml-1">Logradouro Completo</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              className="input-md !pl-12 shadow-sm" 
              value={data.logradouro} 
              onChange={e => onChange('logradouro', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:col-span-2">
          <input type="text" className="input-md shadow-sm" value={data.bairro} onChange={e => onChange('bairro', e.target.value)} placeholder="Bairro" required />
          <input type="text" className="input-md shadow-sm" value={data.cidade} onChange={e => onChange('cidade', e.target.value)} placeholder="Cidade" required />
          <input type="text" maxLength={2} className="input-md shadow-sm !uppercase" value={data.estado} onChange={e => onChange('estado', e.target.value)} placeholder="UF" required />
          <input type="text" className="input-md shadow-sm" value={data.cep} onChange={e => onChange('cep', e.target.value)} placeholder="CEP" required />
        </div>
      </div>
    </MD3Card>
  );
};

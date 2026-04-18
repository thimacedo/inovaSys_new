import React from 'react';
import { Building2, Landmark, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';

/**
 * 💳 FINANCIAL SETTINGS FORM - CONFIGURAÇÃO DE SUBCONTA IUGU
 * Componente MD3 Outlined para captura de dados bancários da Câmara.
 */

interface FinancialSettingsFormProps {
  data: any;
  onChange: (field: string, val: string) => void;
  iuguAccountId?: string;
}

export const FinancialSettingsForm = ({ data, onChange, iuguAccountId }: FinancialSettingsFormProps) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header com Gradiente MD3 */}
      <div className="px-8 py-10 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Landmark size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Configurações Financeiras</h3>
            <p className="text-slate-500 text-sm font-medium">Dados bancários para recebimento via Marketplace Iugu.</p>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-10 space-y-10">
        {/* Iugu Status Badge */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${iuguAccountId ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
          <div className={`p-2 rounded-xl ${iuguAccountId ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest">{iuguAccountId ? 'Conectado à Iugu' : 'Aguardando Configuração'}</span>
            <span className="text-[10px] font-bold opacity-80">{iuguAccountId ? `ID: ${iuguAccountId}` : 'A subconta será criada ao salvar os dados.'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Banco */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Código do Banco</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                <Building2 size={20} />
              </div>
              <input 
                type="text"
                placeholder="Ex: 001, 237, 341"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                value={data.banco || ''}
                onChange={e => onChange('banco', e.target.value)}
              />
            </div>
          </div>

          {/* Tipo de Conta */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tipo de Conta</label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 appearance-none"
              value={data.conta_tipo || 'Corrente'}
              onChange={e => onChange('conta_tipo', e.target.value)}
            >
              <option value="Corrente">Conta Corrente</option>
              <option value="Poupanca">Conta Poupança</option>
            </select>
          </div>

          {/* Agência */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Agência</label>
            <input 
              type="text"
              placeholder="0000-0"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300"
              value={data.agencia || ''}
              onChange={e => onChange('agencia', e.target.value)}
            />
          </div>

          {/* Conta */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Número da Conta</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                <CreditCard size={20} />
              </div>
              <input 
                type="text"
                placeholder="000000-0"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                value={data.conta || ''}
                onChange={e => onChange('conta', e.target.value)}
              />
            </div>
          </div>

          {/* CPF/CNPJ Recebedor */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">CPF ou CNPJ do Titular</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                <UserCheck size={20} />
              </div>
              <input 
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                value={data.recebedor_doc || ''}
                onChange={e => onChange('recebedor_doc', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-slate-400" size={18} />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
            Estes dados são necessários para que a Iugu possa repassar os valores das faturas pagas diretamente para sua conta bancária após a liquidação.
          </p>
        </div>
      </div>
    </div>
  );
};

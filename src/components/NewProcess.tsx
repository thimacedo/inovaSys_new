import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useCreateProcess } from '../presentation/hooks/useProcessos';
import { applyMask, parseMoney } from '../utils/masks';
import { toast } from 'sonner';

interface NewProcessProps {
  onProcessCreated?: () => void;
  camaraId?: string | null;
}

const NewProcess: React.FC<NewProcessProps> = ({ onProcessCreated, camaraId }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const createMutation = useCreateProcess();
  
  const [formData, setFormData] = useState({
    numero_processo: '',
    requerente_nome: '',
    requerente_doc: '',
    requerente_end: '',
    requerido_nome: '',
    requerido_doc: '',
    requerido_end: '',
    valor_causa: '',
    resumo_fatos: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'requerente_doc' || name === 'requerido_doc') {
      maskedValue = applyMask(value, 'doc');
    } else if (name === 'valor_causa') {
      maskedValue = applyMask(value, 'money');
    }

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleProtocolar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        toast.error("Sessão inválida ou expirada. Faça login novamente.");
        return;
      }

      const orgId = currentUser?.organization_id || (currentUser as any)?.organizacao_id;
      if (!orgId) {
        toast.error("Vínculo organizacional não encontrado.");
        return;
      }

      const payload = {
        ...formData,
        valor_causa: parseMoney(formData.valor_causa),
        user_id: session.user.id,
        camara_id: camaraId || undefined,
        organization_id: orgId,
        status: 'Protocolado'
      };

      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success('Processo protocolado com sucesso!');
          if (onProcessCreated) onProcessCreated();
        },
        onError: (err: any) => {
          toast.error('Falha ao criar processo. Verifique os dados.');
          setError(err?.message || "Erro ao criar processo.");
        }
      });
    } catch (err: any) {
      toast.error('Erro de comunicação com o servidor.');
      setError(err?.message || "Falha de comunicação.");
    }
  };

  return (
    <div className="process-form-container max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Protocolar Novo Processo</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Insira os dados das partes e o resumo para iniciar o protocolo.</p>
        </div>
      </div>
      
      {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-bold mb-6">{error}</div>}

      <form onSubmit={handleProtocolar} className="space-y-6">
        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações do Protocolo</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Número do Processo</label>
              <input type="text" name="numero_processo" placeholder="Ex: 001/2024" value={formData.numero_processo} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Valor da Causa (R$)</label>
              <input type="text" name="valor_causa" placeholder="R$ 0,00" value={formData.valor_causa} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requerente</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome / Razão Social</label>
              <input type="text" name="requerente_nome" placeholder="Nome" value={formData.requerente_nome} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CPF/CNPJ</label>
              <input type="text" name="requerente_doc" placeholder="000.000.000-00" value={formData.requerente_doc} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Endereço</label>
              <input type="text" name="requerente_end" placeholder="Rua, número..." value={formData.requerente_end} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requerido</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome / Razão Social</label>
              <input type="text" name="requerido_nome" placeholder="Nome" value={formData.requerido_nome} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CPF/CNPJ</label>
              <input type="text" name="requerido_doc" placeholder="000.000.000-00" value={formData.requerido_doc} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Endereço</label>
              <input type="text" name="requerido_end" placeholder="Rua, número..." value={formData.requerido_end} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm" />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="px-10 py-4 bg-slate-900 border-b-4 border-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {createMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Processando...
              </>
            ) : 'Protocolar Processo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProcess;

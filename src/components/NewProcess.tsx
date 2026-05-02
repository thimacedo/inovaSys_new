import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useCreateProcess } from '../presentation/hooks/useProcessos';
import { applyMask, parseMoney } from '../utils/masks';
import { toast } from 'sonner';
import { Button } from '../presentation/ui/components/Button';
import { financeiroService } from '../services/financeiroService';
import { aiService } from '../services/aiService';
import { notificationService } from '../services/notificationService';
import { Bot } from 'lucide-react';

interface NewProcessProps {
  onProcessCreated?: () => void;
  camaraId?: string | null;
}

const NewProcess: React.FC<NewProcessProps> = ({ onProcessCreated, camaraId }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const createMutation = useCreateProcess();
  
  const [formData, setFormData] = useState({
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
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const handleAISummarize = async () => {
    if (!formData.resumo_fatos) {
      toast.error("Descreva os fatos antes de resumir.");
      return;
    }
    setIsSummarizing(true);
    const toastId = toast.loading("IA analisando e refinando fatos...");
    try {
      const summary = await aiService.improveDraft(formData.resumo_fatos);
      setFormData(prev => ({ ...prev, resumo_fatos: summary }));
      toast.success("Narrativa refinada tecnicamente!", { id: toastId });
    } catch (err) {
      toast.error("Erro ao processar IA.", { id: toastId });
    } finally {
      setIsSummarizing(false);
    }
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

      const orgId = currentUser?.organization_id || currentUser?.camara_id || camaraId;
      const isGod = currentUser?.tipo_usuario === 'god';
      
      if (!orgId && !isGod) {
        toast.error("Vínculo organizacional não encontrado.");
        return;
      }

      const valorCausaNum = parseMoney(formData.valor_causa);
      const payload = {
        ...formData,
        requerente_documento: formData.requerente_doc,
        requerido_documento: formData.requerido_doc,
        requerente_endereco: formData.requerente_end,
        requerido_endereco: formData.requerido_end,
        valor_causa: valorCausaNum,
        user_id: session.user.id,
        camara_id: camaraId || undefined,
        organization_id: orgId || undefined,
        status: 'Protocolado'
      };

      const result = await createMutation.mutateAsync(payload as any);
      
      // Notifica o Presidente da Câmara imediatamente
      if (orgId) {
        try {
          await notificationService.notifyAdmins(orgId, {
            titulo: 'Novo Processo Protocolado',
            mensagem: `O processo ${result.numero_processo} foi protocolado. Atribua um árbitro para iniciar o andamento.`,
            tipo: 'alerta',
            processoId: result.id
          });
        } catch (nError) {
          console.error('Erro ao notificar presidente:', nError);
        }
      }

      // Gera faturamento inicial automático
      try {
        await financeiroService.gerarCustasIniciais(result.id, result.valor_causa || 0, orgId || '');
      } catch (fError) {
        console.error('Erro ao gerar custas:', fError);
      }

      toast.success('Processo protocolado com sucesso!');
      if (onProcessCreated) onProcessCreated();
    } catch (err: any) {
      toast.error('Falha ao criar processo. Verifique os dados.');
      setError(err?.message || "Erro ao criar processo.");
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
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-400">
                Gerado automaticamente após o protocolo
              </div>
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

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narrativa dos Fatos</label>
            <button 
              type="button" 
              onClick={handleAISummarize}
              disabled={isSummarizing}
              className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
            >
              <Bot size={14} />
              RESUMIR COM IA
            </button>
          </div>
          <textarea 
            name="resumo_fatos" 
            placeholder="Descreva detalhadamente o conflito..." 
            value={formData.resumo_fatos} 
            onChange={handleChange} 
            required 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[150px] text-sm font-medium" 
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button 
            type="submit" 
            isLoading={createMutation.isPending}
            size="lg"
            className="px-10"
          >
            Protocolar Processo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProcess;

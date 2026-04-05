import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { processService } from '../services/processService';
import { useAuthStore } from '../presentation/state/useAuthStore';

interface NewProcessProps {
  onProcessCreated?: () => void;
  camaraId?: string | null;
}

const NewProcess: React.FC<NewProcessProps> = ({ onProcessCreated, camaraId }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  
  const [formData, setFormData] = useState({
    numero_processo: '',
    requerente_nome: '',
    requerente_doc: '',
    requerente_end: '',
    requerido_nome: '',
    requerido_doc: '',
    requerido_end: '',
    valor_causa: 0,
    resumo_fatos: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProtocolar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        setError("Sessão inválida ou expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      if (!currentUser?.organization_id) {
        setError("O usuário não possui vínculo com uma organização ativa. Operação bloqueada.");
        setLoading(false);
        return;
      }

      const payloadCompleto = {
        ...formData,
        user_id: session.user.id,
        camara_id: camaraId,
        organization_id: currentUser.organization_id
      };

      await processService.create(payloadCompleto);

      setSuccess(true);
      if (onProcessCreated) {
        setTimeout(() => onProcessCreated(), 2000);
      }

      setFormData({
        numero_processo: '',
        requerente_nome: '',
        requerente_doc: '',
        requerente_end: '',
        requerido_nome: '',
        requerido_doc: '',
        requerido_end: '',
        valor_causa: 0,
        resumo_fatos: ''
      });
    } catch (err: any) {
      console.error('[SUBMIT ERROR]', err);
      
      // Proteção Anti-Crash do React: Garante que o erro seja sempre uma string primitiva
      const errorMessage = typeof err === 'string' 
        ? err 
        : err?.message 
          ? String(err.message) 
          : "Falha de comunicação com o servidor. Verifique o log.";
          
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="process-form-container max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Protocolar Novo Processo</h2>
      
      {error && <div className="error-message p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium mb-6">{error}</div>}
      {success && <div className="success-message p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium mb-6">Processo protocolado com sucesso! Redirecionando...</div>}

      <form onSubmit={handleProtocolar} className="space-y-6">
        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Processo</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Número do Processo</label>
              <input 
                type="text" 
                name="numero_processo" 
                placeholder="Ex: 001/2024" 
                value={formData.numero_processo} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Valor da Causa (R$)</label>
              <input 
                type="number" 
                name="valor_causa" 
                placeholder="0,00" 
                value={formData.valor_causa} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Requerente (Quem Inicia)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome Completo / Razão Social</label>
              <input 
                type="text" 
                name="requerente_nome" 
                placeholder="Nome do Requerente" 
                value={formData.requerente_nome} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CPF ou CNPJ</label>
              <input 
                type="text" 
                name="requerente_doc" 
                placeholder="000.000.000-00" 
                value={formData.requerente_doc} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Endereço Completo</label>
              <input 
                type="text" 
                name="requerente_end" 
                placeholder="Rua, número, bairro, cidade/UF" 
                value={formData.requerente_end} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Requerido (Parte Acionada)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome Completo / Razão Social</label>
              <input 
                type="text" 
                name="requerido_nome" 
                placeholder="Nome do Requerido" 
                value={formData.requerido_nome} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CPF ou CNPJ</label>
              <input 
                type="text" 
                name="requerido_doc" 
                placeholder="000.000.000-00" 
                value={formData.requerido_doc} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Endereço Completo</label>
              <input 
                type="text" 
                name="requerido_end" 
                placeholder="Rua, número, bairro, cidade/UF" 
                value={formData.requerido_end} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border border-slate-100 p-4 rounded-xl">
          <legend className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Fatos e Pedidos</legend>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Resumo dos Fatos</label>
            <textarea 
              name="resumo_fatos" 
              placeholder="Descreva brevemente o conflito e o que está sendo solicitado..." 
              value={formData.resumo_fatos} 
              onChange={handleChange} 
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Protocolar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProcess;

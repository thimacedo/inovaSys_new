import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { applyMask } from '../utils/masks';

interface OnboardingProps {
  session: any;
  onComplete: () => void;
  onSignOut: () => void;
}

export default function Onboarding({ session, onComplete, onSignOut }: OnboardingProps) {
  const [formData, setFormData] = useState({
    nome: session?.user?.user_metadata?.full_name || '',
    documento: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'documento') {
      maskedValue = applyMask(value, 'doc');
    } else if (name === 'telefone') {
      maskedValue = applyMask(value, 'phone');
    }

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // O banco de dados utiliza a coluna 'cpf' e não 'documento'
      const { error: upsertError } = await supabase
        .from('perfis')
        .upsert({
          id: session.user.id,
          nome: formData.nome,
          cpf: formData.documento, // Mapeamento corrigido
          telefone: formData.telefone,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      onComplete();
    } catch (err: any) {
      console.error("[ONBOARDING ERROR]", err);
      // Se houver falha de cache persistente, avisa o usuário
      if (err.message?.includes('schema cache')) {
        setError("O banco de dados está atualizando. Por favor, aguarde 30 segundos e tente novamente.");
      } else {
        setError(err.message || "Erro ao salvar seus dados. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complete seu Perfil</h1>
          <p className="text-sm text-slate-500">
            Identificamos que seu perfil ainda possui dados pendentes. Para acessar sua Câmara e atuar nos processos, informe seus dados reais abaixo.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
            <input 
              type="text" 
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
            <input 
              type="text" 
              name="documento"
              required
              value={formData.documento}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Telefone (Opcional)</label>
            <input 
              type="text" 
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar e Acessar Plataforma'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={onSignOut}
            className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Sair e limpar sessão atual
          </button>
        </div>
      </div>
    </div>
  );
}

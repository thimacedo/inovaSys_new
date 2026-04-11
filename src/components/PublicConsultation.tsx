import React, { useState } from 'react';
import { processService } from '../services/processService';
import { isValidDoc } from '../utils/validators';
import { applyMask } from '../utils/masks';

export default function PublicConsultation({ onBack }: { onBack: () => void }) {
  const [doc, setDoc] = useState('');
  const [num, setNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: precisa de pelo menos um dos campos
    if (!doc && !num) {
      setError('Informe o CPF/CNPJ ou o número do processo.');
      return;
    }

    // Validação de documento se preenchido
    if (doc && !isValidDoc(doc)) {
      setError('Atenção: CPF ou CNPJ inválido.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const cleanDoc = doc.replace(/\D/g, '');
      
      // Busca por número do processo E/OU documento
      let data: any = null;
      
      if (num && cleanDoc) {
        // Busca com ambos filtros
        const results = await processService.publicSearch(num);
        // Filtra por documento manualmente
        const filtered = Array.isArray(results) 
          ? results.filter((p: any) => 
              p.requerente_doc?.replace(/\D/g, '') === cleanDoc || 
              p.requerido_doc?.replace(/\D/g, '') === cleanDoc
            )
          : [];
        data = filtered.length > 0 ? filtered[0] : null;
      } else if (num) {
        // Busca apenas por número
        data = await processService.publicSearch(num);
      } else if (cleanDoc) {
        // Busca apenas por documento - usa service diferente ou query direta
        const { supabase } = await import('../lib/supabase');
        const { data: results, error } = await supabase
          .from('processos')
          .select('*')
          .or(`requerente_doc.ilike.%${cleanDoc}%,requerido_doc.ilike.%${cleanDoc}%`)
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        data = results;
      }

      if (!data) {
        setError('Processo não encontrado ou documento inválido para este processo.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle,_#f8fafc_0%,_#e2e8f0_100%)] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 space-y-8 transition-all hover:shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-blue-600">Consulta Pública</h2>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Acompanhamento processual</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleConsult} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CPF/CNPJ da Parte</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" 
                placeholder="000.000.000-00" 
                value={doc}
                onChange={(e) => setDoc(applyMask(e.target.value, 'doc'))}
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Número do Processo</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" 
                placeholder="Ex: 2024.001" 
                value={num}
                onChange={(e) => setNum(e.target.value)}
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Consultando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Consultar Situação
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-bold text-blue-600">Processo: {result.numero_processo}</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                {result.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Requerente</span>
                <span className="text-slate-900 font-bold">{result.requerente_nome}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Requerido</span>
                <span className="text-slate-900 font-bold">{result.requerido_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Abertura</span>
                <span className="text-slate-900 font-bold">{new Date(result.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}

        <button 
          className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2" 
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar ao Login
        </button>
      </div>
    </div>
  );
}

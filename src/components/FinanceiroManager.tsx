import React, { useState } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg, useUpdateFinanceiro } from '../presentation/hooks/useFinanceiro';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Search, 
  Download, 
  CheckCircle, 
  Clock, 
  FileText,
  Calendar
} from 'lucide-react';
import { ProcessRowSkeleton } from '../presentation/ui/components/Skeleton';

export default function FinanceiroManager() {
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useAuthStore(state => state.currentUser);

  const organizationId = currentUser?.organization_id || (currentUser as any)?.organizacao_id;
  const { data: registros = [], isLoading: loading } = useFinanceiroByOrg(organizationId);
  const updateMutation = useUpdateFinanceiro();

  const handleMarcarPago = async (id: string) => {
    const promise = updateMutation.mutateAsync({ 
      id, 
      data: { 
        status: 'Pago', 
        data_pagamento: new Date().toISOString() 
      } 
    });

    toast.promise(promise, {
      loading: 'Confirmando pagamento...',
      success: 'Pagamento processado com sucesso!',
      error: 'Erro ao processar pagamento.'
    });
  };

  const filtered = registros.filter(r => {
    const matchStatus = filterStatus === 'Todos' || r.status === filterStatus;
    const matchSearch = r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       r.processos?.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: registros.reduce((acc, r) => acc + Number(r.valor), 0),
    pendente: registros.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + Number(r.valor), 0),
    pago: registros.filter(r => r.status === 'Pago').reduce((acc, r) => acc + Number(r.valor), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            Gestão Financeira
          </h2>
          <p className="text-slate-500 text-sm mt-1">Controle consolidado de custas e honorários da unidade.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Pendente</p>
            <p className="text-xl font-black text-amber-600">R$ {stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-px h-10 bg-slate-100 mx-2 hidden md:block"></div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Recebido</p>
            <p className="text-xl font-black text-emerald-600">R$ {stats.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por descrição ou processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {['Todos', 'Pendente', 'Pago'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === s 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
          <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Processo</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><ProcessRowSkeleton /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">Nenhum registro encontrado.</td></tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-blue-600">{reg.processos?.numero_processo || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{reg.descricao}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{reg.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm">{reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-black ${reg.status === 'Pago' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-[10px] font-black uppercase ${reg.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {reg.status === 'Pago' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {reg.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {reg.status === 'Pendente' && (
                          <button 
                            onClick={() => handleMarcarPago(reg.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

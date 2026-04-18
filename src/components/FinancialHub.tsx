import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg, useUpdateFinanceiro } from '../presentation/hooks/useFinanceiro';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  Calendar, 
  Search, 
  Download, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  LayoutDashboard,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { ProcessRowSkeleton } from '../presentation/ui/components/Skeleton';
import { usePermissions } from '../hooks/usePermissions';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { BIMetricsGrid } from './financeiro-bi/BIMetricsGrid';
import { BIChartsSection } from './financeiro-bi/BIChartsSection';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MonthData {
  label: string;
  month: number;
  year: number;
  total: number;
}

export default function FinancialHub() {
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCharts, setShowCharts] = useState(true);
  
  const currentUser = useAuthStore(state => state.currentUser);
  const { isAtLeastAdmin } = usePermissions();
  
  const organizationId = currentUser?.organization_id || (currentUser as any)?.organizacao_id || currentUser?.camara_id;
  const { data: registros = [], isLoading, refetch } = useFinanceiroByOrg(organizationId);
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

  const processedData = useMemo(() => {
    // BI Processing
    const months: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ 
        label: d.toLocaleString('pt-BR', { month: 'short' }), 
        month: d.getMonth(), 
        year: d.getFullYear(), 
        total: 0 
      });
    }

    registros.forEach(reg => {
      if (reg.status === 'Pago' && reg.created_at) {
        const d = new Date(reg.created_at);
        if (!isNaN(d.getTime())) {
          const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
          if (idx !== -1) months[idx].total += Number(reg.valor);
        }
      }
    });

    const dist = { Custa: 0, Hon_Arbitral: 0, Hon_Sucumbencia: 0 };
    registros.forEach(reg => {
      const tipo = reg.tipo as keyof typeof dist;
      if (dist[tipo] !== undefined) dist[tipo] += Number(reg.valor);
    });

    const totalReceita = registros.filter(d => d.status === 'Pago').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPendente = registros.filter(d => d.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.valor), 0);

    // Filter logic for Table
    const filtered = registros.filter(r => {
      const matchStatus = filterStatus === 'Todos' || r.status === filterStatus;
      const matchSearch = r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.processos?.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });

    return {
      bar: { 
        labels: months.map(m => m.label), 
        datasets: [{ 
          label: 'Receita', 
          data: months.map(m => m.total), 
          backgroundColor: '#6750A4', 
          borderRadius: 12 
        }] 
      },
      doughnut: { 
        labels: ['Custas', 'Hon. Arbitrais', 'Sucumbência'], 
        datasets: [{ 
          data: [dist.Custa, dist.Hon_Arbitral, dist.Hon_Sucumbencia], 
          backgroundColor: ['#006A60', '#6750A4', '#92400E'], 
          borderWidth: 0 
        }] 
      },
      stats: [
        { label: 'Receita Líquida', value: totalReceita, icon: DollarSign, color: 'emerald' },
        { label: 'Fluxo Pendente', value: totalPendente, icon: Calendar, color: 'blue' },
        { label: 'Ticket Médio', value: totalReceita / (registros.length || 1), icon: TrendingUp, color: 'purple' },
        { label: 'Inadimplência', value: (totalPendente / (totalReceita + totalPendente || 1)) * 100, isPercent: true, icon: ArrowDownRight, color: 'red' },
      ],
      filtered
    };
  }, [registros, filterStatus, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* 🚀 Header MD3 Unificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-md-surface-variant/20 p-8 rounded-[32px] border border-md-outline/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-md-primary text-md-on-primary rounded-2xl shadow-md">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-md-on-surface tracking-tight">Financial Hub</h2>
            <p className="text-md-on-surface-variant/70 text-sm font-medium">Inteligência e Gestão Financeira Integrada</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-2.5 bg-md-surface text-md-on-surface border border-md-outline/10 rounded-full text-xs font-bold hover:bg-md-surface-variant/10 transition-all active:scale-95 shadow-sm"
          >
            {isLoading ? <Clock className="animate-spin" size={16} /> : <TrendingUp size={16} />}
            Atualizar Dados
          </button>
          <button className="p-3 bg-md-primary-container text-md-on-primary-container rounded-full hover:shadow-md transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* 📊 Grid de Métricas (BI) */}
      <BIMetricsGrid stats={processedData.stats} />

      {/* 📈 Seção de Gráficos (BI) com Toggle */}
      <div className="bg-md-surface rounded-[32px] border border-md-outline/5 overflow-hidden shadow-sm transition-all">
        <button 
          onClick={() => setShowCharts(!showCharts)}
          className="w-full px-8 py-4 flex items-center justify-between hover:bg-md-surface-variant/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-md-primary" />
            <span className="text-sm font-bold text-md-on-surface uppercase tracking-wider">Visualização Analítica</span>
          </div>
          {showCharts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showCharts && (
          <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
            <BIChartsSection barData={processedData.bar} doughnutData={processedData.doughnut} />
          </div>
        )}
      </div>

      {/* 🔍 Barra de Filtros Integrada */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={20} />
          <input 
            type="text"
            placeholder="Buscar por descrição ou número do processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-md-surface border border-md-outline/10 rounded-[24px] focus:ring-2 focus:ring-md-primary/20 outline-none transition-all shadow-sm text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          {['Todos', 'Pendente', 'Pago'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                filterStatus === s 
                ? 'bg-md-primary text-md-on-primary border-md-primary shadow-md' 
                : 'bg-md-surface text-md-on-surface-variant border-md-outline/10 hover:bg-md-surface-variant/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Tabela de Lançamentos Unificada */}
      <div className="bg-md-surface rounded-[32px] border border-md-outline/5 overflow-hidden shadow-md transition-all">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-md-surface-variant/10 border-b border-md-outline/5">
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em]">Processo</th>
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em]">Descrição</th>
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em]">Vencimento</th>
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em] text-right">Valor</th>
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em] text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.15em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><ProcessRowSkeleton /></td>
                  </tr>
                ))
              ) : processedData.filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <FileText size={48} />
                      <p className="text-sm font-medium italic">Nenhum registro financeiro encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processedData.filtered.map((reg) => (
                  <tr key={reg.id} className="group hover:bg-md-primary/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-md-primary bg-md-primary/5 px-3 py-1 rounded-full border border-md-primary/10">
                        {reg.processos?.numero_processo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-md-on-surface">{reg.descricao}</span>
                        <span className="text-[10px] text-md-on-surface-variant/60 font-black uppercase tracking-wider mt-0.5">{reg.tipo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-md-on-surface-variant">
                        <Calendar size={14} className="opacity-40" />
                        <span className="text-sm font-medium">
                          {reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${reg.status === 'Pago' ? 'text-emerald-600' : 'text-md-on-surface'}`}>
                          R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2 py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          reg.status === 'Pago' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {reg.status === 'Pago' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {reg.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {reg.status === 'Pendente' && isAtLeastAdmin && (
                          <button 
                            onClick={() => handleMarcarPago(reg.id)}
                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 shadow-sm"
                            title="Confirmar Pagamento"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2.5 text-md-on-surface-variant/40 hover:text-md-primary hover:bg-md-primary/5 rounded-xl transition-all border border-md-outline/10 shadow-sm">
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

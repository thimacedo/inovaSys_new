import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg, useUpdateFinanceiro } from '../presentation/hooks/useFinanceiro';
import { 
  DollarSign, 
  TrendingUp, 
  Search, 
  CheckCircle, 
  Clock, 
  Plus,
  QrCode,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { ProcessRowSkeleton } from '../presentation/ui/components/Skeleton';
import { usePermissions } from '../hooks/usePermissions';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { BIMetricsGrid } from './financeiro-bi/BIMetricsGrid';

/**
 * 💰 FINANCIAL HUB INOVASYS - v4.0
 * Focado 100% em transações PIX e controle de assentos.
 */
export default function FinancialHub() {
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  
  const currentUser = useAuthStore(state => state.currentUser);
  const { isGod, isPresident } = usePermissions();
  
  const organizationId = currentUser?.organization_id || currentUser?.camara_id || '';
  const { data: registros = [], isLoading, refetch } = useFinanceiroByOrg(organizationId);
  const updateMutation = useUpdateFinanceiro();

  // 📝 Simulação de Payload PIX (Copia e Cola)
  const pixPayload = "00020126580014br.gov.bcb.pix013645398276-8572-4d37-8822-263f19112883520400005303986540510.005802BR5915InovaSys Camara6009SAO PAULO62070503***6304E2B8";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    toast.success('Código PIX copiado com sucesso!');
  };

  const handleMarcarPago = async (id: string) => {
    if (!isGod) return; // Apenas God confirma pagamentos no SaaS

    const promise = updateMutation.mutateAsync({ 
      id, 
      data: { 
        status: 'Pago', 
        pago_at: new Date().toISOString() 
      } 
    });

    toast.promise(promise, {
      loading: 'Confirmando recebimento...',
      success: 'Pagamento validado!',
      error: 'Erro ao validar.'
    });
  };

  const processedData = useMemo(() => {
    const totalReceita = registros.filter(d => d.status === 'Pago').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPendente = registros.filter(d => d.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.valor), 0);

    const filtered = registros.filter(r => {
      const matchStatus = filterStatus === 'Todos' || r.status === filterStatus;
      const matchSearch = r.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });

    const stats = [
      { label: 'Total Pago (PIX)', value: totalReceita, icon: DollarSign, color: 'emerald' },
      { label: 'Aguardando PIX', value: totalPendente, icon: Clock, color: 'blue' },
      { label: 'Assentos Ativos', value: 5, isRaw: true, icon: TrendingUp, color: 'purple' }, // Exemplo estático
    ];

    return { filtered, stats };
  }, [registros, filterStatus, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* 🚀 Header MD3 Financeiro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-md-surface-variant/10 p-8 rounded-[32px] border border-md-outline/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md">
            <QrCode size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-md-on-surface tracking-tight uppercase italic">Financial Hub <span className="text-emerald-500">PIX</span></h2>
            <p className="text-md-on-surface-variant/70 text-sm font-medium">Controle de Assinatura e Assentos Extras</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isPresident && (
            <button 
              onClick={() => setIsPixModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-md-primary text-md-on-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
            >
              <Plus size={16} />
              Comprar Assentos
            </button>
          )}
          <button 
            onClick={() => refetch()}
            className="p-3 bg-md-surface border border-md-outline/10 rounded-full hover:bg-md-surface-variant/10 transition-all"
          >
            <Clock size={20} />
          </button>
        </div>
      </div>

      <BIMetricsGrid stats={processedData.stats} />

      {/* 🔍 Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={20} />
          <input 
            type="text"
            placeholder="Pesquisar faturas ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-md-surface border border-md-outline/10 rounded-[24px] focus:ring-2 focus:ring-md-primary/20 outline-none shadow-sm text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['Todos', 'Pendente', 'Pago'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as 'Todos' | 'Pendente' | 'Pago')}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === s 
                ? 'bg-md-primary text-md-on-primary' 
                : 'bg-md-surface text-md-on-surface-variant border border-md-outline/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Tabela de Transações PIX */}
      <div className="bg-md-surface rounded-[32px] border border-md-outline/5 overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-md-surface-variant/5 border-b border-md-outline/5">
              <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-widest">Descrição</th>
              <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-widest">Vencimento</th>
              <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-widest text-right">Valor</th>
              <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-md-outline/5">
            {isLoading ? (
              <tr key="loading"><td colSpan={5}><ProcessRowSkeleton /></td></tr>
            ) : processedData.filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center italic text-slate-400">Nenhuma transação encontrada.</td></tr>
            ) : (
              processedData.filtered.map((reg) => (
                <tr key={reg.id} className="group hover:bg-md-primary/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-md-on-surface">{reg.descricao}</span>
                      <span className="text-[9px] text-md-on-surface-variant/50 font-black uppercase">Metodo: PIX</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-md-on-surface-variant">
                      {reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-md-on-surface">
                    R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        reg.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'Pendente' && (
                        <>
                          {isGod ? (
                             <button onClick={() => handleMarcarPago(reg.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-100">
                               <CheckCircle size={18} />
                             </button>
                          ) : (
                             <button onClick={() => setIsPixModalOpen(true)} className="p-2 text-md-primary hover:bg-md-primary/5 rounded-xl border border-md-outline/10">
                               <QrCode size={18} />
                             </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 MODAL PIX (Material You) */}
      <AnimatePresence>
        {isPixModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPixModalOpen(false)}
              className="absolute inset-0 bg-md-surface/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-md-surface-container-high w-full max-w-md rounded-[40px] p-8 shadow-md-3 border border-md-outline/10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-[24px] flex items-center justify-center mb-6">
                  <QrCode size={40} />
                </div>
                <h3 className="text-xl font-black text-md-on-surface uppercase italic">Pagamento via <span className="text-emerald-600">PIX</span></h3>
                <p className="text-sm text-md-on-surface-variant/70 mt-2 mb-8">Efetue o pagamento para liberação imediata de novos assentos na sua Câmara.</p>

                <div className="w-full bg-md-surface p-6 rounded-[32px] border border-md-outline/10 mb-6">
                   <div className="aspect-square bg-white p-4 rounded-2xl mb-4 flex items-center justify-center border border-slate-100">
                      {/* Placeholder para QR Code Real */}
                      <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-40">
                         <QrCode size={64} className="text-slate-300" />
                         <span className="text-[10px] font-bold uppercase mt-2">QR Code Estático</span>
                      </div>
                   </div>
                   <div className="text-xs font-mono text-md-on-surface-variant break-all bg-md-surface-container p-4 rounded-xl text-left border border-md-outline/5 select-all">
                      {pixPayload}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={handleCopyPix}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                  >
                    <Copy size={16} /> Copiar
                  </button>
                  <button 
                    onClick={() => setIsPixModalOpen(false)}
                    className="bg-md-surface text-md-on-surface-variant py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-md-outline/10"
                  >
                    Fechar
                  </button>
                </div>
                <p className="text-[9px] uppercase font-bold text-md-on-surface-variant/40 mt-6 tracking-[0.2em]">Sincronização via Webhook InovaSys</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

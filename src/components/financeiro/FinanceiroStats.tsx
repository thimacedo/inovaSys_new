import React from 'react';
import { TrendingDown, TrendingUp, Plus } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface FinanceiroStatsProps {
  totalPendente: number;
  totalPago: number;
  isAtLeastAdmin: boolean;
  onNewClick: () => void;
}

export const FinanceiroStats: React.FC<FinanceiroStatsProps> = ({ 
  totalPendente, 
  totalPago, 
  isAtLeastAdmin, 
  onNewClick 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MD3Card variant="filled" className="flex items-center justify-between border-amber-100 bg-amber-50/20">
        <div>
          <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-widest mb-1">Pendências</p>
          <p className="text-2xl font-black text-amber-700">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 bg-amber-100 text-amber-700 rounded-[20px] shadow-sm">
          <TrendingDown size={24} />
        </div>
      </MD3Card>
      
      <MD3Card variant="filled" className="flex items-center justify-between border-emerald-100 bg-emerald-50/20">
        <div>
          <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest mb-1">Liquidado</p>
          <p className="text-2xl font-black text-emerald-700">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 bg-emerald-100 text-emerald-700 rounded-[20px] shadow-sm">
          <TrendingUp size={24} />
        </div>
      </MD3Card>

      <div className="flex items-center justify-center">
        {isAtLeastAdmin && (
          <button 
            onClick={onNewClick}
            className="btn-md-primary w-full !py-6 !rounded-[28px] !shadow-none border-2 border-dashed border-md-primary/20 bg-transparent text-md-primary hover:bg-md-primary/5 hover:border-md-primary/40 transition-all"
          >
            <Plus size={20} />
            Novo Lançamento
          </button>
        )}
      </div>
    </div>
  );
};

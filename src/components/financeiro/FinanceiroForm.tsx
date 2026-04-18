import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface FinanceiroFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export const FinanceiroForm: React.FC<FinanceiroFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_vencimento: new Date().toISOString().split('T')[0]
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <MD3Card variant="elevated" className="!bg-md-on-surface !text-md-surface p-8">
        <div className="flex justify-between items-center mb-8">
          <h5 className="text-lg font-bold flex items-center gap-3">
            <div className="w-1.5 h-6 bg-md-primary-container rounded-full" />
            Novo Registro Financeiro
          </h5>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 ml-1">Descrição do Lançamento</label>
            <input 
              type="text" 
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              className="w-full bg-white/10 border-b-2 border-white/20 rounded-t-xl px-4 py-4 text-sm focus:border-md-primary-container outline-none transition-all placeholder:text-white/20"
              placeholder="Ex: Custas de Protocolo - Lote A"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 ml-1">Valor Estimado (R$)</label>
            <input 
              type="text" 
              value={formData.valor}
              onChange={e => setFormData({...formData, valor: e.target.value})}
              className="w-full bg-white/10 border-b-2 border-white/20 rounded-t-xl px-4 py-4 text-sm focus:border-md-primary-container outline-none transition-all"
              placeholder="0,00"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-md-primary !bg-md-primary-container !text-md-on-primary-container !px-12 !py-4 shadow-xl">
              <Save size={18} />
              Finalizar Lançamento
            </button>
          </div>
        </form>
      </MD3Card>
    </motion.div>
  );
};

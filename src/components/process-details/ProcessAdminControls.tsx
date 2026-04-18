import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProcessAdminControlsProps {
  isAdmin: boolean;
  arbitroId: string | null;
  arbitros: any[];
  isAssigning: boolean;
  onAssign: (id: string) => void;
}

export const ProcessAdminControls: React.FC<ProcessAdminControlsProps> = ({
  isAdmin,
  arbitroId,
  arbitros,
  isAssigning,
  onAssign
}) => {
  if (!isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-md-tertiary-container/30 border-b border-md-outline/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-md-tertiary text-md-on-tertiary rounded-[16px] flex items-center justify-center shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-md-on-tertiary-container uppercase tracking-widest">Controle Institucional</h3>
          <p className="text-[10px] text-md-on-tertiary-container opacity-60 font-bold uppercase tracking-widest">Somente Gestores e Administradores</p>
        </div>
      </div>
      <div className="flex-1 w-full max-w-md">
        <select 
          className="input-md !rounded-xl !h-12 !bg-md-surface border-none shadow-sm focus:ring-4 focus:ring-md-primary/10"
          value={arbitroId || ''}
          onChange={(e) => onAssign(e.target.value)}
          disabled={isAssigning}
        >
          <option value="">-- Designar Árbitro Responsável --</option>
          {arbitros.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.email})</option>)}
        </select>
      </div>
    </motion.div>
  );
};

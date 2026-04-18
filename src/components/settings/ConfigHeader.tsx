import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'motion/react';

export const ConfigHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-5">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-md-primary text-md-on-primary rounded-[24px] shadow-md-2"
        >
          <Settings size={32} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-md-on-surface tracking-tight uppercase">Configurações Gerais</h2>
          <p className="text-sm font-medium text-md-on-surface-variant opacity-80">Gestão de identidade, infraestrutura e faturamento da câmara.</p>
        </div>
      </div>
    </div>
  );
};

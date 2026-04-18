import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamHeaderProps {
  onAddClick: () => void;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-5">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-md-primary text-md-on-primary rounded-[24px] shadow-md-2"
        >
          <Users size={32} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Equipe Institucional</h2>
          <p className="text-sm font-medium text-md-on-surface-variant opacity-80">Controle de acesso e designação de árbitros.</p>
        </div>
      </div>
      
      <button 
        onClick={onAddClick}
        className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary hover:shadow-md hover:brightness-110 shadow-lg shadow-md-primary/20 !px-8 !py-4"
      >
        <UserPlus size={20} />
        Convidar Membro
      </button>
    </div>
  );
};

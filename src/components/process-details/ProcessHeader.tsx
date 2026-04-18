import React from 'react';
import { ChevronRight, FileText, Bot, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../presentation/ui/components/Button';
import { Processo } from '../../services/processService';

interface ProcessHeaderProps {
  processo: Processo;
  isAdmin: boolean;
  onBack: () => void;
  onSentencaIA: () => void;
  onGerarTermo: () => void;
  isGeneratingDoc: boolean;
}

export const ProcessHeader: React.FC<ProcessHeaderProps> = ({
  processo,
  isAdmin,
  onBack,
  onSentencaIA,
  onGerarTermo,
  isGeneratingDoc
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* 📍 Breadcrumbs MD3 */}
      <nav className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-md-on-surface-variant/60 px-1">
        <button onClick={onBack} className="hover:text-md-primary transition-colors">Processos</button>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-md-primary font-bold">Detalhes {processo.numero_processo}</span>
      </nav>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-md-primary text-md-on-primary rounded-[24px] shadow-md-2"
          >
            <FileText size={32} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">
              Processo <span className="text-md-primary">{processo.numero_processo}</span>
            </h2>
            <p className="text-sm font-medium text-md-on-surface-variant opacity-80">
              Última atualização: {new Date(processo.updated_at || '').toLocaleDateString('pt-BR')} às {new Date(processo.updated_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        {/* ⚡ Ações Rápidas (Pills) */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={onSentencaIA}
            icon={Bot}
            size="md"
            className="rounded-full bg-md-primary-container text-md-on-primary-container border-none hover:shadow-md"
          >
            Sentença IA
          </Button>
          <Button 
            variant="outline" 
            onClick={onGerarTermo} 
            isLoading={isGeneratingDoc}
            icon={Download}
            size="md"
            className="rounded-full border-md-outline/20"
          >
            Gerar Termo
          </Button>
          <Button 
            variant="secondary" 
            onClick={onBack}
            icon={ArrowLeft}
            size="md"
            className="rounded-full bg-md-surface-variant/50 text-md-on-surface-variant"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

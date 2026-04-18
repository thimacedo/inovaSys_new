import React from 'react';
import { ExternalLink, CreditCard, ArrowRight, RefreshCw, Link as LinkIcon, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { Processo } from '../../services/processService';
import { PJeService } from '../../services/integrations/PJeService';
import { useModal } from '../../context/ModalContext';

interface ProcessSummaryCardsProps {
  processo: Processo;
  canEdit: boolean;
  onEditField: (field: keyof Processo, label: string, value: any) => void;
  faturasPendentes?: any[];
  isAdmin?: boolean;
}

export const ProcessSummaryCards: React.FC<ProcessSummaryCardsProps> = ({
  processo,
  canEdit,
  onEditField,
  faturasPendentes = [],
  isAdmin = false
}) => {
  const { showToast } = useModal();
  const hasPendingInvoices = faturasPendentes.length > 0;
  const showCheckoutCTA = hasPendingInvoices && !isAdmin;

  const handleSincronizarTribunal = async () => {
    if (!processo.numero_processo_judicial) return;
    
    try {
      // Inicia consulta ao PJe via Proxy MNI
      const data = await PJeService.consultarProcesso(processo.numero_processo_judicial, '');
      
      // Espelha andamentos para a timeline interna
      await PJeService.syncToTimeline(processo.id, data);
      
      showToast('Sincronização com o Tribunal concluída com sucesso!', 'success');
    } catch (error) {
      console.error('[ProcessSummaryCards] Erro na sincronização:', error);
      showToast('Falha ao sincronizar andamentos com o PJe.', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 💳 CARD DE CHECKOUT (MD3 Elevated CTA) */}
      {showCheckoutCTA && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4 }}
          className="p-6 bg-amber-500/10 rounded-[28px] border-2 border-amber-500/20 relative group transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                <CreditCard size={18} />
              </div>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Ação Necessária</span>
            </div>
            <h4 className="text-xl font-black text-amber-900 leading-tight mb-2">Aguardando Pagamento de Custas</h4>
            <p className="text-xs text-amber-800/70 font-medium mb-6">
              Existem {faturasPendentes.length} fatura(s) pendente(s) que impedem o prosseguimento célere do feito.
            </p>
          </div>

          <button 
            onClick={() => {
              const url = faturasPendentes[0]?.metadata?.checkout_url;
              if (url) window.open(url, '_blank');
            }}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 group/btn"
          >
            Pagar Agora (PIX/Boleto)
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* Card: Registro */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-surface-variant/20 rounded-[28px] border border-md-outline/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('numero_processo', 'Número do Processo', processo.numero_processo)} 
            className="absolute top-5 right-5 p-2 text-md-on-surface-variant/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest block mb-3">Registro Oficial</span>
        <p className="text-xl font-black text-md-on-surface tracking-tight">{processo.numero_processo}</p>
      </motion.div>

      {/* Card: Situação */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-surface-variant/20 rounded-[28px] border border-md-outline/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('status', 'Situação do Processo', processo.status)} 
            className="absolute top-5 right-5 p-2 text-md-on-surface-variant/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest block mb-3">Fase Processual</span>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-md-primary animate-pulse shadow-[0_0_12px_rgba(103,80,164,0.4)]"></div>
          <p className="text-xl font-black text-md-on-surface uppercase tracking-tight">{processo.status || 'Protocolado'}</p>
        </div>
      </motion.div>

      {/* Card: Valor */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-primary-container/20 rounded-[28px] border border-md-primary/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('valor_causa', 'Valor da Causa', processo.valor_causa)} 
            className="absolute top-5 right-5 p-2 text-md-primary/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-primary/60 uppercase tracking-widest block mb-3">Montante em Lide</span>
        <p className="text-xl font-black text-md-primary">
          {Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </motion.div>

      {/* ⚖️ CARD DE VÍNCULO JUDICIAL (MD3 Outlined) */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-transparent rounded-[28px] border-2 border-md-outline/10 relative group transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-md-secondary-container flex items-center justify-center text-md-on-secondary-container">
              <Scale size={18} />
            </div>
            <span className="text-[10px] font-black text-md-on-surface-variant/60 uppercase tracking-widest">Interoperabilidade</span>
          </div>
          
          <h4 className="text-xl font-black text-md-on-surface leading-tight mb-2">Vínculo Judicial</h4>
          
          {processo.numero_processo_judicial ? (
            <div className="space-y-1">
              <p className="text-lg font-bold text-md-primary tracking-tight">{processo.numero_processo_judicial}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-green-600 font-black uppercase tracking-wider">Sincronizado via MNI</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-md-on-surface-variant/60 font-medium">
              Nenhum processo judicial vinculado a esta demanda arbitral.
            </p>
          )}
        </div>

        <div className="mt-6">
          {processo.numero_processo_judicial ? (
            <button 
              onClick={handleSincronizarTribunal}
              className="w-full py-3 bg-md-secondary-container hover:bg-md-secondary-container/80 text-md-on-secondary-container rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all group/btn"
            >
              <RefreshCw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" />
              Sincronizar com Tribunal
            </button>
          ) : (
            <button 
              onClick={() => onEditField('numero_processo_judicial', 'Número do Processo Judicial', '')}
              className="w-full py-3 border-2 border-md-primary text-md-primary hover:bg-md-primary/5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LinkIcon size={14} />
              Vincular Processo Judicial
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

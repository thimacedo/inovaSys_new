import React, { useState, useMemo } from 'react';
import { useAuditLogs, useViewLogs } from '../presentation/hooks/useSettings';
import { Calendar, Eye, Globe, User } from 'lucide-react';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { AuditHeader } from './audit/AuditHeader';
import { AuditFilters } from './audit/AuditFilters';
import { AuditDetailsCard } from './audit/AuditDetailsCard';

export default function Auditoria() {
  const [activeTab, setActiveTab] = useState<'acoes' | 'visualizacoes'>('acoes');
  const { data: logs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useAuditLogs();
  const { data: viewLogs = [], isLoading: isLoadingViews, refetch: refetchViews } = useViewLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const isLoading = activeTab === 'acoes' ? isLoadingLogs : isLoadingViews;

  const filteredLogs = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (activeTab === 'acoes') {
      return (logs || []).filter((log: any) => 
        (log.acao || '').toLowerCase().includes(term) ||
        (log.perfil?.nome || '').toLowerCase().includes(term) ||
        JSON.stringify(log.dados_novos || log.dados_antigos || {}).toLowerCase().includes(term)
      );
    } else {
      return (viewLogs || []).filter((log: any) => 
        (log.documento_nome || '').toLowerCase().includes(term) ||
        (log.perfil?.nome || '').toLowerCase().includes(term) ||
        (log.ip_address || '').toLowerCase().includes(term)
      );
    }
  }, [logs, viewLogs, searchTerm, activeTab]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (filteredLogs || []).forEach(log => {
      const typedLog = log as any;
      const rawDate = typedLog.created_at || typedLog.data_hora;
      if (!rawDate) return;
      
      try {
        const dateObj = new Date(rawDate);
        if (isNaN(dateObj.getTime())) return;
        
        const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
      } catch (e) {
        // Silently skip invalid dates
      }
    });
    return groups;
  }, [filteredLogs]);

  if (isLoading && filteredLogs.length === 0) return <div className="flex items-center justify-center py-40"><div className="w-12 h-12 border-4 border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      
      <AuditHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onRefresh={() => activeTab === 'acoes' ? refetchLogs() : refetchViews()} 
        loading={isLoading} 
      />

      <AuditFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        placeholder={`Filtrar ${activeTab === 'acoes' ? 'atividades críticas' : 'acessos a documentos'}...`} 
      />

      <div className="space-y-16 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-md-primary/20 before:via-md-outline/10 before:to-transparent">
        {Object.keys(grouped).map((date) => (
          <div key={date} className="relative space-y-8">
            <div className="flex items-center gap-6 mb-10">
               <div className="w-24 h-24 bg-md-surface border border-md-outline/10 shadow-sm rounded-full flex flex-col items-center justify-center z-10 sticky top-24">
                  <Calendar size={18} className="text-md-primary mb-1" />
                  <span className="text-[10px] font-black text-md-on-surface-variant/40 uppercase text-center leading-tight px-2">
                    {date}
                  </span>
               </div>
               <div className="h-px bg-md-outline/5 flex-1"></div>
            </div>

            <div className="space-y-4 pl-24 lg:pl-32">
              {grouped[date].map((log: any) => (
                activeTab === 'acoes' ? (
                  <AuditDetailsCard 
                    key={log.id} 
                    log={log} 
                    isExpanded={expandedLog === log.id} 
                    onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)} 
                  />
                ) : (
                  <div key={log.id} className="bg-md-surface border border-md-outline/5 rounded-[28px] p-6 flex items-center justify-between shadow-sm hover:bg-md-surface-variant/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="p-3.5 bg-md-secondary/10 text-md-secondary rounded-2xl group-hover:bg-md-secondary group-hover:text-md-on-secondary transition-all">
                        <Eye size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-md-on-surface">{log.documento_nome}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-widest">
                            <User size={12} className="opacity-50" />
                            {log.perfil?.nome || 'Usuário Externo'}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-widest">
                            <Globe size={12} className="opacity-50" />
                            {log.ip_address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-md-on-surface uppercase tracking-tighter">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString('pt-BR') : '--:--'}
                      </p>
                      <p className="text-[9px] font-bold text-md-on-surface-variant/40 uppercase tracking-widest mt-0.5">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString('pt-BR') : '--/--/----'}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

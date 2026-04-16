import React, { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import { ShieldCheck, User, Globe, Clock, Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';

export const ProcessAudit: React.FC<{ processoId: string }> = ({ processoId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    try {
      const data = await auditService.getLogsByProcesso(processoId);
      setLogs(data || []);
    } catch (e) {
      console.error('Erro ao carregar auditoria:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [processoId]);

  const filteredLogs = logs.filter(log => 
    log.documento_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.perfil?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compilando Trilha de Auditoria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-blue-600" size={16} />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Compliance & Transparência</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-sm">Rastreamento imutável de todas as visualizações de documentos e acessos aos autos.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Filtrar por documento ou usuário..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic text-sm">Nenhum registro de visualização encontrado.</div>
        ) : (
          filteredLogs.map((log, idx) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-slate-100 rounded-[1.5rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{log.documento_nome}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <User size={10} />
                      {log.perfil?.nome || 'Usuário Externo'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Globe size={10} />
                      {log.ip_address}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-[10px] font-black text-slate-900 uppercase">
                  {new Date(log.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

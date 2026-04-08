import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Info, Smartphone } from 'lucide-react';
import { pushService } from '../services/pushService';
import { notificationService, Notificacao } from '../services/notificationService';
import { useAuthStore } from '../presentation/state/useAuthStore';

export default function Notifications({ onSelectProcess }: { onSelectProcess: (processoId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const currentUser = useAuthStore(state => state.currentUser);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.id) {
      carregarNotificacoes();
      setShowPwaPrompt(Notification.permission === 'default');
      // Polling básico
      const interval = setInterval(carregarNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const carregarNotificacoes = async () => {
    if (!currentUser?.id) return;
    const items = await notificationService.getAll(currentUser.id);
    setNotificacoes(items);
    setUnreadCount(items.filter(i => !i.lida).length);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    await carregarNotificacoes();
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    await notificationService.markAllAsRead(currentUser.id);
    await carregarNotificacoes();
  };

  const handleNotificationClick = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      await notificationService.markAsRead(notificacao.id);
      carregarNotificacoes();
    }
    setOpen(false);
    if (notificacao.processo_id) {
      onSelectProcess(notificacao.processo_id);
    }
  };

  const handleEnablePush = async () => {
    const granted = await pushService.requestPermission();
    if (granted) {
      setShowPwaPrompt(false);
      pushService.sendLocalTest('InovaSys Ativado!', 'Você agora receberá alertas processuais em tempo real.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors"
        title="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bell size={16} className="text-blue-600" />
                Notificações
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] uppercase tracking-widest font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notificacoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Bell size={32} className="opacity-20" />
                  <p className="text-sm font-medium">Você não tem notificações.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notificacoes.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 cursor-pointer transition-colors group ${!item.lida ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!item.lida ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Info size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!item.lida ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {item.titulo}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">
                              {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${!item.lida ? 'text-slate-600' : 'text-slate-500'}`}>
                            {item.mensagem}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            {item.processo_id && (
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                                Ver Processo
                              </span>
                            )}
                            {!item.lida && (
                              <button 
                                onClick={(e) => handleMarkAsRead(item.id, e)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Check size={12} /> Lido
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PWA Prompt */}
            {showPwaPrompt && (
              <div className="p-4 bg-blue-600">
                <div className="flex gap-3 items-start">
                   <div className="p-2 bg-white/20 rounded-lg text-white">
                      <Smartphone size={16} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-white mb-1">Alertas em tempo real</p>
                      <p className="text-[10px] text-blue-100 leading-tight mb-3">Deseja receber notificações no seu celular ou desktop mesmo com o InovaSys fechado?</p>
                      <div className="flex gap-2">
                         <button 
                           onClick={handleEnablePush}
                           className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-50 transition-colors"
                         >
                           Habilitar Agora
                         </button>
                         <button 
                           onClick={() => setShowPwaPrompt(false)}
                           className="text-white/60 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:text-white transition-colors"
                         >
                           Depois
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

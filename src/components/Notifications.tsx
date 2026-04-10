import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Info, MessageCircle } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useNotifications, useMarkNotificationAsRead } from '../presentation/hooks/useNotifications';
import { useModal } from '../context/ModalContext';

export default function Notifications({ onSelectProcess }: { onSelectProcess: (processoId: string) => void }) {
  const [open, setOpen] = useState(false);
  const currentUser = useAuthStore(state => state.currentUser);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showPrompt } = useModal();

  // TanStack Query
  const { data: notificacoes = [], isLoading } = useNotifications(currentUser?.id);
  const markAsReadMutation = useMarkNotificationAsRead();

  const unreadCount = notificacoes.filter(i => !i.lida).length;
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
       setShowPwaPrompt(Notification.permission === 'default');
    }
  }, [currentUser]);

  const handleNotificationClick = async (notificacao: any) => {
    if (!notificacao.lida) markAsReadMutation.mutate(notificacao.id);
    setOpen(false);
    if (notificacao.processo_id) onSelectProcess(notificacao.processo_id as string);
  };

  const handleWhatsAppNotify = (e: React.MouseEvent, msg: string) => {
    e.stopPropagation();
    showPrompt("Notificar via WhatsApp", "Confirme o número do celular (apenas números com DDD):", "", (phone) => {
      if (!phone) return;
      whatsappService.enviarMensagem(phone, msg);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Bell size={16} className="text-blue-600" /> Notificações</h3>
            </div>

            <div className="overflow-y-auto flex-1">
              {notificacoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Sem notificações no momento.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notificacoes.map((item) => (
                    <div key={item.id} onClick={() => handleNotificationClick(item)} className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors group ${!item.lida ? 'bg-blue-50/20' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!item.lida ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Info size={16} />
                        </div>
                        <div className="flex-1">
                           <p className={`text-sm ${!item.lida ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{item.titulo}</p>
                           <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.mensagem}</p>
                           <div className="mt-3 flex items-center justify-between">
                               <span className="text-[10px] text-slate-400 font-bold uppercase">
                                 {item.created_at 
                                   ? new Date(item.created_at).toLocaleDateString() 
                                   : new Date().toLocaleDateString()}
                               </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleWhatsAppNotify(e, item.mensagem)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100" title="Repassar via WhatsApp">
                                  <MessageCircle size={14} />
                                </button>
                                {!item.lida && (
                                  <button onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate(item.id); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

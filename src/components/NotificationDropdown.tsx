import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Loader2 } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (loading) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Notificações</h3>
        {notifications.some((n) => !n.lida) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 hover:bg-gray-50 transition-colors ${
                !notif.lida ? 'bg-blue-50' : ''
              }`}
            >
              <div
                onClick={() => {
                  if (!notif.lida) markAsRead(notif.id);
                  onClose();
                }}
                className="block cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800">{notif.titulo}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.mensagem}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
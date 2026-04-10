# Script: fix-build.ps1
# Executar no PowerShell dentro da pasta E:\inovasys

Write-Host "Substituindo arquivos com erros..." -ForegroundColor Cyan

# 1. src/components/Notifications.tsx
@"
import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  link?: string;
}

interface NotificationsProps {
  userId: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: `user_id=eq.` + userId },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: Notification) => !n.lida).length);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((item: Notification) => (
                <div
                  key={item.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${!item.lida ? 'bg-blue-50' : ''}`}
                >
                  <div
                    onClick={() => {
                      if (!item.lida) markAsRead(item.id);
                      setIsOpen(false);
                      if (item.link) window.location.href = item.link;
                    }}
                    className="block cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800">{item.titulo}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.mensagem}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
"@ | Set-Content -Path src/components/Notifications.tsx -Encoding UTF8

# 2. src/presentation/hooks/useNotifications.ts
@"
import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuthStore } from '../state/authStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await notificationService.fetch(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.lida).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    const unsubscribe = notificationService.subscribe(userId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, loadNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    setUnreadCount(0);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
"@ | Set-Content -Path src/presentation/hooks/useNotifications.ts -Encoding UTF8

# 3. src/infrastructure/database/BaseSupabaseRepository.ts
@"
import { SupabaseClient } from '@supabase/supabase-js';
import { logAudit } from '../../services/auditoriaService';

export class BaseSupabaseRepository<T extends { id: string }> {
  constructor(
    protected client: SupabaseClient,
    protected tableName: string
  ) {}

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert([data as any])
      .select()
      .single();

    if (error) throw error;
    await logAudit('create', this.tableName, result.id, undefined, data);
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const oldData = await this.getById(id);
    if (!oldData) throw new Error('Registro não encontrado');

    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAudit('update', this.tableName, id, oldData, data);
    return result as T;
  }

  async delete(id: string): Promise<void> {
    const oldData = await this.getById(id);
    if (!oldData) throw new Error('Registro não encontrado');

    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    await logAudit('delete', this.tableName, id, oldData, undefined);
  }

  async list(page = 0, pageSize = 10): Promise<T[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return (data as T[]) || [];
  }
}
"@ | Set-Content -Path src/infrastructure/database/BaseSupabaseRepository.ts -Encoding UTF8

Write-Host "Arquivos substituídos. Executando build local para teste..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build local bem-sucedido. Fazendo commit e push..." -ForegroundColor Green
    git add .
    git commit -m "fix: corrige Notifications, useNotifications e BaseSupabaseRepository"
    git push origin Inova
    Write-Host "Push realizado. Acompanhe o deploy no Vercel." -ForegroundColor Green
} else {
    Write-Host "Build local falhou. Verifique os erros acima." -ForegroundColor Red
}
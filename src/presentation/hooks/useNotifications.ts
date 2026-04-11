import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuthStore } from '../state/useAuthStore';

export const NOTIFICATIONS_KEY = 'notifications';

export function useNotifications() {
  const { currentUser: user } = useAuthStore();
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
      console.error('Erro ao carregar notificaÃ§Ãµes:', error);
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

export const NOTIFICATIONS_KEY = 'notifications';

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      return await notificationService.listByUser(userId);
    },
    enabled: !!userId,
    refetchInterval: 1000 * 60 * 2, // Polling a cada 2 minutos
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    }
  });
}

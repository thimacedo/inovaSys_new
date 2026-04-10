import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import type { NotificationEntity } from '../infrastructure/database/repositories/NotificationRepository';

export const notificationService = {
  create: async (data: Partial<NotificationEntity>) => DependencyRegistry.getNotificationRepository().create(data),
  listByUser: async (userId: string) => DependencyRegistry.getNotificationRepository().listByUser(userId),
  markAsRead: async (id: string) => DependencyRegistry.getNotificationRepository().markAsRead(id),
  delete: async (id: string) => DependencyRegistry.getNotificationRepository().delete(id)
};

export default notificationService;

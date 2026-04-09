import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import { CalendarEvent } from '../../infrastructure/database/repositories/CalendarRepository';

export const CALENDAR_KEY = 'calendar_events';

export function useCalendarEvents(camaraId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: [CALENDAR_KEY, camaraId, start, end],
    queryFn: async () => {
      if (!camaraId) return [];
      return await DependencyRegistry.getCalendarRepository().listByCamara(camaraId, start, end);
    },
    enabled: !!camaraId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => 
      await DependencyRegistry.getCalendarRepository().create(event),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] })
  });
}

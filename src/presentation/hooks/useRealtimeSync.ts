import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseClientFactory } from '../../infrastructure/database/SupabaseClientFactory';
import { useAuthStore } from '../state/useAuthStore';
import { PROCESSOS_QUERY_KEY } from './useProcessos';
import { NOTIFICATIONS_KEY } from './useNotifications';
import { FINANCEIRO_ORG_KEY, FINANCEIRO_PROCESS_KEY } from './useFinanceiro';
import { TEAM_KEY } from './useTeam';
import { CALENDAR_KEY } from './useCalendar';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const client = SupabaseClientFactory.createBrowser();

    const channel = client.channel('inovasys_global_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'processos' },
        () => {
          console.log('[Realtime] Processos atualizados. Invalidando cache...');
          queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificacoes', filter: `user_id=eq.${currentUser.id}` },
        () => {
          console.log('[Realtime] Nova notificação recebida.');
          queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financeiro' },
        () => {
          console.log('[Realtime] Dados financeiros alterados.');
          queryClient.invalidateQueries({ queryKey: [FINANCEIRO_ORG_KEY] });
          queryClient.invalidateQueries({ queryKey: [FINANCEIRO_PROCESS_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perfis' },
        () => {
          console.log('[Realtime] Mudança na equipe detectada.');
          queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        () => {
          console.log('[Realtime] Agenda da câmara atualizada.');
          queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Sincronização global ativada.');
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);
}

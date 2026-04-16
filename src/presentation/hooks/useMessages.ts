import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import { MessageEntity } from '../../infrastructure/database/repositories/MessageRepository';

const messageRepository = DependencyRegistry.getMessageRepository();

export const useMessages = (processoId: string) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', processoId],
    queryFn: () => messageRepository.getByProcesso(processoId),
    enabled: !!processoId,
  });

  const sendMessage = useMutation({
    mutationFn: (data: Partial<MessageEntity>) => messageRepository.create(data),
    onSuccess: () => {
      // O Supabase Realtime cuidará da atualização, 
      // mas invalidamos por segurança ou para casos de latência.
      queryClient.invalidateQueries({ queryKey: ['messages', processoId] });
    },
  });

  useEffect(() => {
    if (!processoId) return;

    const subscription = messageRepository.subscribeToProcess(processoId, (newMessage) => {
      queryClient.setQueryData(['messages', processoId], (old: MessageEntity[] = []) => {
        // Evitar duplicatas se o mutate já inseriu
        if (old.some(m => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [processoId, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
};

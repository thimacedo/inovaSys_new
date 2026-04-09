import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import { HISTORY_KEY } from './useHistory';

export const ATTACHMENTS_KEY = 'attachments';

export function useAttachments(processoId: string | undefined) {
  return useQuery({
    queryKey: [ATTACHMENTS_KEY, processoId],
    queryFn: async () => {
      if (!processoId) return [];
      return await DependencyRegistry.getAttachmentRepository().listByProcesso(processoId);
    },
    enabled: !!processoId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, processoId, userId }: { file: File; processoId: string; userId: string }) => {
      return await DependencyRegistry.getAttachmentRepository().uploadFile(file, processoId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENTS_KEY, variables.processoId] });
      // Registro automático no histórico
      DependencyRegistry.getHistoryRepository().addEntry(
        variables.processoId,
        'Novo anexo adicionado',
        'usuario',
        `Arquivo "${variables.file.name}" anexado ao processo.`,
        variables.userId
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.processoId] });
      });
    }
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath, processoId, userId }: { id: string; storagePath: string; processoId: string; userId?: string }) => {
      return await DependencyRegistry.getAttachmentRepository().deleteAttachment(id, storagePath);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENTS_KEY, variables.processoId] });
      // Registro automático no histórico
      DependencyRegistry.getHistoryRepository().addEntry(
        variables.processoId,
        'Anexo removido',
        'usuario',
        'Um documento foi excluído do processo.',
        variables.userId
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.processoId] });
      });
    }
  });
}

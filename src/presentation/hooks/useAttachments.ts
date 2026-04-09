import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

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
    }
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      return await DependencyRegistry.getAttachmentRepository().deleteAttachment(id, storagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENTS_KEY] });
    }
  });
}

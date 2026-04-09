import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attachmentService from '../../services/attachmentService';
import historyService from '../../services/historyService';

export const ATTACHMENTS_KEY = 'attachments';
const HISTORY_KEY = 'process_history';

export function useAttachments(processoId: string | undefined) {
  return useQuery({
    queryKey: [ATTACHMENTS_KEY, processoId],
    queryFn: async () => processoId ? attachmentService.listByProcesso(processoId) : [],
    enabled: !!processoId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { file: File; processoId: string; userId: string }) => 
      attachmentService.uploadFile(vars.file, vars.processoId, vars.userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENTS_KEY, variables.processoId] });
      
      // Registo automático de histórico
      historyService.addEntry(
        variables.processoId, 
        'Novo anexo', 
        'usuario', 
        `Arquivo "${variables.file.name}" anexado.`, 
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
    mutationFn: (vars: { id: string; storagePath: string; processoId: string; userId: string; fileName?: string }) => 
      attachmentService.deleteAttachment(vars.id, vars.storagePath),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENTS_KEY, variables.processoId] });
      
      // Registo automático de remoção no histórico
      historyService.addEntry(
        variables.processoId,
        'Arquivo removido',
        'usuario',
        `O arquivo "${variables.fileName || 'Anexo'}" foi excluído do processo.`,
        variables.userId
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.processoId] });
      });
    }
  });
}

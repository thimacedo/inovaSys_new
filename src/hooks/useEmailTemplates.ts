// src/hooks/useEmailTemplates.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { EmailTemplate } from '../core/domain/entities/EmailTemplate';
import { toast } from 'sonner';

const emailRepo = DependencyRegistry.getEmailRepository();

export function useEmailTemplates(organizationId: string) {
  const queryKey = ['emailTemplates', organizationId];

  const { data: templates, isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => emailRepo.getAll(organizationId),
    enabled: !!organizationId,
  });

  return {
    templates: templates || [],
    isLoading,
    error,
  };
}

export function useEmailTemplateMutations(organizationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['emailTemplates', organizationId];

  const createMutation = useMutation({
    mutationFn: (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) =>
      emailRepo.create(templateData),
    onSuccess: () => {
      toast.success('Template de e-mail criado com sucesso!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(`Falha ao criar template: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, templateData }: { id: string, templateData: Partial<EmailTemplate> }) =>
      emailRepo.update(id, templateData),
    onSuccess: () => {
      toast.success('Template de e-mail atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar template: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailRepo.delete(id),
    onSuccess: () => {
      toast.success('Template de e-mail excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(`Falha ao excluir template: ${error.message}`);
    },
  });

  return {
    createTemplate: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTemplate: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteTemplate: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

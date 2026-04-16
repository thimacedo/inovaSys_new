import { useMutation } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

const publicConsultationRepository = DependencyRegistry.getPublicConsultationRepository();

export const usePublicConsultation = () => {
  const consultMutation = useMutation({
    mutationFn: ({ numeroProcesso, codigoValidacao }: { numeroProcesso: string, codigoValidacao: string }) => 
      publicConsultationRepository.consultarSentenca(numeroProcesso, codigoValidacao),
  });

  return {
    consultar: consultMutation.mutateAsync,
    resultado: consultMutation.data,
    isLoading: consultMutation.isPending,
    error: consultMutation.error as any,
    reset: consultMutation.reset,
  };
};

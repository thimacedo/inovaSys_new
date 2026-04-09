import { useMutation, useQuery } from '@tanstack/react-query';
import { aiService } from '../../services/aiService';
import { signatureService, SignatureRequest } from '../../services/signatureService';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

export function useAI() {
  const suggestMutation = useMutation({
    mutationFn: async ({ contexto, prompt }: { contexto: string, prompt: string }) => 
      await aiService.suggestClausula(contexto, prompt)
  });

  const improveMutation = useMutation({
    mutationFn: async (text: string) => await aiService.improveDraft(text)
  });

  return { suggestMutation, improveMutation };
}

export function useSignature(camaraId: string | undefined) {
  const { data: config } = useQuery({
    queryKey: ['camara_settings', camaraId],
    queryFn: async () => camaraId ? await DependencyRegistry.getCamaraRepository().getById(camaraId) : null,
    enabled: !!camaraId
  });

  const sendMutation = useMutation({
    mutationFn: async (request: SignatureRequest) => {
      if (!config) throw new Error("Configurações da Câmara não carregadas.");
      return await signatureService.sendForSignature(config, request);
    }
  });

  return { sendMutation, config };
}

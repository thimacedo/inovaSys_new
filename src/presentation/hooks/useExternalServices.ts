import { useMutation, useQuery } from '@tanstack/react-query';
import { askAI } from '../../services/aiService';
import { signatureService, SignatureRequest } from '../../services/signatureService';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

export function useAI() {
  const suggestMutation = useMutation({
    mutationFn: async ({ contexto, prompt }: { contexto: string, prompt: string }) => 
      await askAIsuggestClausula(contexto, prompt)
  });

  const improveMutation = useMutation({
    mutationFn: async (text: string) => await askAIimproveDraft(text)
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
      return await signatureService.createEnvelope(config, request);
    }
  });

  return { sendMutation, config };
}


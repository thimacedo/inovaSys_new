import { useQuery } from '@tanstack/react-query';
import { templateService } from '../../services/templateService';

export const TEMPLATES_KEY = 'templates';

export function useTemplateByType(tipoDocumento: number | undefined) {
  return useQuery({
    queryKey: [TEMPLATES_KEY, tipoDocumento],
    queryFn: async () => {
      if (tipoDocumento === undefined) return null;
      return await templateService.getByType(tipoDocumento);
    },
    enabled: tipoDocumento !== undefined,
    staleTime: Infinity, // Templates raramente mudam, cache permanente na sessão
  });
}

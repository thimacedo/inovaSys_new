import { useQuery } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

export const useUser = (email: string | undefined) => {
  return useQuery<any | null, Error>({
    queryKey: ['user', email],
    queryFn: async () => {
      if (!email) {
        return null;
      }
      const useCase = DependencyRegistry.getGetUserByEmailUseCase();
      return useCase.execute(email);
    },
    enabled: !!email,
  });
};

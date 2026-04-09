import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

export const TEAM_KEY = 'team_members';

export function useTeamMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: [TEAM_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return await DependencyRegistry.getTeamRepository().listByOrganization(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      await DependencyRegistry.getTeamRepository().updateUserRole(userId, newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
    }
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await DependencyRegistry.getTeamRepository().removeUserFromOrganization(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
    }
  });
}

import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';

export const teamService = {
  listByOrganization: async (orgId: string) => 
    DependencyRegistry.getTeamRepository().listByOrganization(orgId),
    
  updateUserRole: async (userId: string, newRole: string) => 
    DependencyRegistry.getTeamRepository().updateUserRole(userId, newRole),
    
  removeUser: async (userId: string) => 
    DependencyRegistry.getTeamRepository().removeUserFromOrganization(userId)
};

export default teamService;

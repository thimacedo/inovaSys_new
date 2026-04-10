import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import type { FinanceiroEntity } from '../infrastructure/database/repositories/FinanceiroRepository';

export interface RegistroFinanceiro extends FinanceiroEntity {}

export const financeiroService = {
  create: async (data: Partial<FinanceiroEntity>) => DependencyRegistry.getFinanceiroRepository().create(data),
  update: async (id: string, data: Partial<FinanceiroEntity>) => DependencyRegistry.getFinanceiroRepository().update(id, data),
  delete: async (id: string) => DependencyRegistry.getFinanceiroRepository().delete(id),
  listByOrganization: async (orgId: string) => DependencyRegistry.getFinanceiroRepository().listByOrganization(orgId),
  listByProcesso: async (processoId: string) => DependencyRegistry.getFinanceiroRepository().listByProcesso(processoId),
  getByProcesso: async (processoId: string) => DependencyRegistry.getFinanceiroRepository().listByProcesso(processoId)
};

export default financeiroService;

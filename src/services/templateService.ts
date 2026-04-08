import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';

export const templateService = {
  getByType: async (tipo: number) => DependencyRegistry.getTemplateRepository().getByType(tipo)
};

export default templateService;

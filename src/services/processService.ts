import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { ProcessEntity } from '../infrastructure/database/repositories/ProcessRepository';

export const createProcess = async (data: Partial<ProcessEntity>): Promise<ProcessEntity> => {
  return await DependencyRegistry.getProcessRepository().create(data);
};

export const getProcessById = async (id: string): Promise<ProcessEntity | null> => {
  return await DependencyRegistry.getProcessRepository().getById(id);
};

export const getProcessosByCamara = async (camaraId: string): Promise<ProcessEntity[]> => {
  return await DependencyRegistry.getProcessRepository().listByCamara(camaraId);
};

export const updateProcess = async (id: string, data: Partial<ProcessEntity>): Promise<ProcessEntity> => {
  return await DependencyRegistry.getProcessRepository().update(id, data);
};

export const deleteProcess = async (id: string): Promise<void> => {
  return await DependencyRegistry.getProcessRepository().delete(id);
};

export const processService = {
  create: createProcess,
  createProcess, // Alias para legacy code
  getById: getProcessById,
  getProcessById, // Alias
  listByCamara: getProcessosByCamara,
  getProcessosByCamara, // Alias
  update: updateProcess,
  updateProcess, // Alias
  delete: deleteProcess,
  deleteProcess // Alias
};

export default processService;

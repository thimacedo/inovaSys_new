import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { ProcessEntity } from '../infrastructure/database/repositories/ProcessRepository';

export type Processo = ProcessEntity;

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

export const getAll = async (page = 1, pageSize = 10, search = '') => {
  return await DependencyRegistry.getProcessRepository().listWithPagination(page, pageSize, search);
};

export const assignArbitrator = async (id: string, arbitroId: string): Promise<ProcessEntity> => {
  return await DependencyRegistry.getProcessRepository().update(id, { arbitro_id: arbitroId });
};

export const publicSearch = async (query: string): Promise<ProcessEntity | null> => {
  return await DependencyRegistry.getProcessRepository().publicSearch(query);
};

export const processService = {
  create: createProcess,
  createProcess,
  getById: getProcessById,
  getProcessById,
  listByCamara: getProcessosByCamara,
  getProcessosByCamara,
  update: updateProcess,
  updateProcess,
  delete: deleteProcess,
  deleteProcess,
  getAll,
  assignArbitrator,
  publicSearch
};

export default processService;

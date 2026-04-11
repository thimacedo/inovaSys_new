import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { Processo } from '../core/domain/entities/Processo';

export type { Processo };

export const createProcess = async (data: Partial<Processo>): Promise<Processo> => {
  return await DependencyRegistry.getProcessRepository().create(data);
};

export const getProcessById = async (id: string): Promise<Processo | null> => {
  return await DependencyRegistry.getProcessRepository().getById(id);
};

export const getProcessosByCamara = async (camaraId: string): Promise<Processo[]> => {
  return await DependencyRegistry.getProcessRepository().listByCamara(camaraId);
};

export const updateProcess = async (id: string, data: Partial<Processo>): Promise<Processo> => {
  return await DependencyRegistry.getProcessRepository().update(id, data);
};

export const deleteProcess = async (id: string): Promise<void> => {
  return await DependencyRegistry.getProcessRepository().delete(id);
};

export const getAll = async (camaraId: string | undefined, page = 1, pageSize = 10, search = '') => {
  return await DependencyRegistry.getProcessRepository().listWithPagination(page, pageSize);
};

export const assignArbitrator = async (id: string, arbitroId: string): Promise<Processo> => {
  return await DependencyRegistry.getProcessRepository().update(id, { arbitro_id: arbitroId });
};

export const publicSearch = async (query: string): Promise<Processo | null> => {
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


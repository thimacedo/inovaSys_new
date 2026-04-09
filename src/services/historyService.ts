import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { HistoryEntity } from '../infrastructure/database/repositories/HistoryRepository';

export const historyService = {
  listByProcesso: async (processoId: string) => 
    DependencyRegistry.getHistoryRepository().listByProcesso(processoId),
    
  addEntry: async (processoId: string, titulo: string, tipo: HistoryEntity['tipo'], descricao?: string, autorId?: string, metadata?: any) => 
    DependencyRegistry.getHistoryRepository().addEntry(processoId, titulo, tipo, descricao, autorId, metadata)
};

export default historyService;

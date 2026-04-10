import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import type { HistoryEntity } from '../infrastructure/database/repositories/HistoryRepository';

/**
 * Facade para gestão de histórico e andamentos do processo.
 * Garante o uso da tabela 'historico_processos' via repositório.
 */
export const historyService = {
  listByProcesso: async (processoId: string) => 
    DependencyRegistry.getHistoryRepository().listByProcesso(processoId),
    
  addEntry: async (
    processoId: string, 
    titulo: string, 
    tipo: HistoryEntity['tipo'], 
    descricao?: string, 
    autorId?: string, 
    metadata?: any
  ) => 
    DependencyRegistry.getHistoryRepository().addEntry(processoId, titulo, tipo, descricao, autorId, metadata)
};

export default historyService;

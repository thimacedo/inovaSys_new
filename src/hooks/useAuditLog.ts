import { useCallback } from 'react';
import { logAudit, AuditAction } from '../services/auditoriaService';

/**
 * @file useAuditLog.ts
 * @description Hook para facilitar o uso do serviço de auditoria em componentes React.
 */

export function useAuditLog() {
  const log = useCallback(async (
    acao: AuditAction, 
    entidade: string, 
    id: string, 
    antes?: Record<string, any>, 
    depois?: Record<string, any>
  ) => {
    return logAudit(acao, entidade, id, antes, depois);
  }, []);

  return { log };
}

export default useAuditLog;

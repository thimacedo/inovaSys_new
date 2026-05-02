import { useAuthStore } from '../presentation/state/useAuthStore';
import { UserRole } from '../core/domain/entities/Usuario';

/**
 * 🔒 MOTOR DE PERMISSÕES INOVASYS (v4.0)
 * Centraliza a lógica de acesso baseada nos perfis oficiais.
 */

export function usePermissions() {
  const currentUser = useAuthStore(state => state.currentUser);
  const role = (currentUser?.tipo_usuario || '').toLowerCase() as UserRole;

  return {
    // Perfis Individuais
    isGod: role === 'god',           // Adm Geral (SaaS)
    isGlobalAdmin: role === 'god',   // Alias legado
    isSales: role === 'vendas',      // Comercial
    isPresident: role === 'presidente', // Gestor da Câmara
    isArbitro: role === 'arbitro',   // Executor de Processos
    isAssistant: role === 'assistente', // Auxiliar Administrativo
    isOperator: role === 'operador', // Operador Básico

    // Agrupamentos e Capacidades de Acesso
    
    // Acesso total ao sistema (CRUDs globais, resoluções rápidas)
    canManageAll: role === 'god',
    
    // Acesso a vendas e cadastro de novas câmaras
    canPerformSales: ['god', 'vendas'].includes(role),
    
    // Acesso às configurações da instituição e gestão de equipe
    canManageCamara: ['god', 'presidente'].includes(role),
    
    // Capacidade de dar andamento aos processos (documentos, sentenças)
    canExecuteProcess: ['god', 'presidente', 'arbitro'].includes(role),
    
    // Entrada de processos e consultas básicas
    canInputData: ['god', 'presidente', 'arbitro', 'assistente', 'operador'].includes(role),
    
    // Auditoria do sistema
    canSeeAudit: ['god', 'presidente'].includes(role),

    // Níveis hierárquicos (MD3 UI logic)
    isAtLeastAdmin: ['god', 'presidente'].includes(role),
    isAtLeastPresident: ['god', 'presidente'].includes(role),
    isAtLeastArbitro: ['god', 'presidente', 'arbitro'].includes(role),
    
    currentRole: role
  };
}

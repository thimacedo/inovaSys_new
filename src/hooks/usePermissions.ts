import { useAuthStore } from '../presentation/state/useAuthStore';

export function usePermissions() {
  const currentUser = useAuthStore(state => state.currentUser);
  const role = (currentUser?.tipo_usuario || '').toLowerCase();

  return {
    isGod: role === 'god',
    isGestor: role === 'gestor',
    isAdmin: role === 'admin',
    isControle: role === 'controle',
    isAssistente: role === 'assistente',
    isArbitro: role === 'arbitro',
    
    // Agrupamentos comuns
    isAtLeastAdmin: ['god', 'gestor', 'admin'].includes(role),
    isAtLeastAssistente: ['god', 'gestor', 'admin', 'assistente'].includes(role),
    isGlobalAdmin: ['god', 'gestor'].includes(role),
    canManageTeam: ['god', 'gestor', 'admin'].includes(role),
    canCreateProcess: ['god', 'gestor', 'admin', 'assistente'].includes(role),
    canSeeAudit: ['god', 'gestor'].includes(role)
  };
}

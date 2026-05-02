/**
 * 👑 HIERARQUIA DE PODER INOVASYS (v4.0)
 * Centralização de nomenclaturas para evitar "imperfeições" de conexão.
 */

export const USER_ROLES = {
  // Nível SaaS (Fora das Câmaras)
  GOD: 'god',           // Super Admin / Diretoria Técnica
  SALES: 'vendas',      // Comercial / Expansão

  // Nível Unidade (Dentro das Câmaras)
  PRESIDENT: 'presidente', // Gestor / Dono da Unidade
  ARBITRATOR: 'arbitro',   // Executor Processual
  ASSISTANT: 'assistente'  // Auxiliar Operacional
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  god: 'Diretoria SaaS',
  vendas: 'Executivo de Vendas',
  presidente: 'Presidente da Câmara',
  arbitro: 'Árbitro(a)',
  assistente: 'Assistente'
};

export interface Camara {
  id: string;
  nome: string;
  plano_id: string;
  limite_usuarios_extra: number;
  configuracoes?: any; // JSONB do banco
  created_at: string;
}

export type UserRole = 'god' | 'vendas' | 'presidente' | 'arbitro' | 'assistente' | 'operador';

export interface Usuario {
  id: string;
  email?: string;
  nome: string | null;
  tipo_usuario: UserRole;
  camara_id: string | null;
  organization_id?: string | null; // Alias/Fallback para camara_id
  cpf: string | null;
  endereco: string | null;
  created_at: string;
}

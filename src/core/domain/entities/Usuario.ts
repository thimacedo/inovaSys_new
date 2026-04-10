export interface Usuario {
  id: string;
  email?: string;
  nome?: string;
  tipo_usuario?: string;
  camara_id?: string;
  organization_id?: string;
  cpf?: string;
  endereco?: string;
  created_at?: string;
  [key: string]: any;
}

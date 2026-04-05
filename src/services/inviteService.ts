import { supabase } from '../lib/supabase';

export interface OrgInvite {
  id: string;
  organization_id: string;
  role: 'admin' | 'arbitro' | 'assistente';
  token: string;
  email_destino: string | null;
  expires_at: string;
  created_at: string;
}

export const inviteService = {
  /**
   * Cria um novo convite para a organização.
   * Restrito via RLS: Apenas 'admins' da organização podem executar.
   */
  async createInvite(organizationId: string, role: 'admin' | 'arbitro' | 'assistente', email?: string) {
    const { data, error } = await supabase
      .from('org_invites')
      .insert([{
        organization_id: organizationId,
        role,
        email_destino: email || null
      }])
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar convite: ${error.message}`);
    return data as OrgInvite;
  },

  /**
   * Lista os convites ativos de uma organização.
   */
  async listInvites(organizationId: string) {
    const { data, error } = await supabase
      .from('org_invites')
      .select('*')
      .eq('organization_id', organizationId)
      .gt('expires_at', new Date().toISOString());

    if (error) throw new Error(`Erro ao listar convites: ${error.message}`);
    return data as OrgInvite[];
  },

  /**
   * Consome o token de convite via RPC.
   * Valida cota do plano, insere em org_members e deleta o token.
   */
  async acceptInvite(token: string) {
    const { data, error } = await supabase.rpc('accept_invite', {
      invite_token: token
    });

    if (error) throw new Error(`Falha ao aceitar convite: ${error.message}`);
    return data;
  },

  /**
   * Revoga/deleta um convite pendente.
   */
  async revokeInvite(id: string) {
    const { error } = await supabase
      .from('org_invites')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao revogar convite: ${error.message}`);
    return true;
  }
};

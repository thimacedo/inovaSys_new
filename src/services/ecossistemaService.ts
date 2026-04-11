import { supabase } from '../lib/supabase';
import { emailService } from './emailService';

export interface Plano {
  id: string;
  nome: string;
  limite_usuarios: number;
  preco: number;
}

export interface Camara {
  id: string;
  nome: string;
  plano_id: string;
  plano_nome?: string;
  limite_usuarios_extra: number;
  data_expiracao: string;
  dias_bonus: number;
  ativa: boolean;
  created_at: string;
  mrr?: number;
}

export interface ParceiroEcossistema {
  id: string;
  nome: string;
  categoria: 'Escritório de Advocacia' | 'Seguradora' | 'Banco' | 'Instituição Pública';
  status: 'Ativo' | 'Pendente';
  logo_url?: string;
}

export const ecossistemaService = {
  async getPlanos(): Promise<Plano[]> {
    const { data, error } = await supabase.from('planos').select('*').order('preco', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('Tabela "planos" não encontrada ou vazia, usando dados mockados.');
      return [
        { id: '00000000-0000-0000-0000-000000000001', nome: 'Starter', limite_usuarios: 4, preco: 499 },
        { id: '00000000-0000-0000-0000-000000000002', nome: 'Pro', limite_usuarios: 10, preco: 999 },
        { id: '00000000-0000-0000-0000-000000000003', nome: 'Enterprise', limite_usuarios: 50, preco: 2499 },
      ];
    }
    return data;
  },

  async getContas(): Promise<Camara[]> {
    const { data, error } = await supabase
      .from('camaras')
      .select('*, planos(nome, preco)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Tabela "camaras" não encontrada, usando dados mockados.');
      return [
        { id: '1', nome: 'Câmara de Arbitragem Matriz', plano_id: '00000000-0000-0000-0000-000000000003', plano_nome: 'Enterprise', limite_usuarios_extra: 0, data_expiracao: '2026-01-01', dias_bonus: 0, ativa: true, created_at: '2025-01-01', mrr: 2499 },
        { id: '2', nome: 'Câmara de Mediação Sul', plano_id: '00000000-0000-0000-0000-000000000002', plano_nome: 'Pro', limite_usuarios_extra: 0, data_expiracao: '2026-02-01', dias_bonus: 15, ativa: true, created_at: '2025-02-01', mrr: 999 },
      ];
    }
    
    return data.map(c => ({
      ...c,
      plano_nome: c.planos?.nome,
      mrr: c.planos?.preco
    }));
  },

  /**
   * Cria uma nova Câmara e um novo usuário gestor (via Admin)
   */
  async createCamara(nome: string, planoId: string, gestorEmail: string, diasBonus: number = 0) {
    try {
      const generateSecurePassword = (): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        const array = new Uint8Array(24);
        crypto.getRandomValues(array);
        return Array.from(array, n => chars[n % chars.length]).join('');
      };
      const tempPassword = generateSecurePassword();

      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      dataExpiracao.setDate(dataExpiracao.getDate() + diasBonus);

      // 1. Inserir Câmara
      const { data: camara, error: camaraError } = await supabase
        .from('camaras')
        .insert([{
          nome,
          plano_id: planoId,
          data_expiracao: dataExpiracao.toISOString(),
          dias_bonus: diasBonus
        }])
        .select()
        .single();

      if (camaraError) throw camaraError;

      // 2. Criar Auth (via Fetch para evitar logout automático do Admin/Gestor logado)
      // O Supabase Client faz o login automático do novo usuário se usarmos auth.signUp
      // Por isso, usamos fetch direto à API de Auth para o signup silencioso
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: gestorEmail.trim(),
          password: tempPassword,
          data: { tipo_usuario: 'gestor', camara_id: camara.id }
        })
      });

      const json = await res.json();

      if (!res.ok) {
        console.error('Erro Auth (Silent Signup):', json.msg || json.message);
        throw new Error(json.msg || json.message || 'Erro ao criar conta do gestor');
      }

      // 3. Criar Perfil
      if (json.user?.id) {
        await supabase.from('perfis').insert([{
          id: json.user.id,
          tipo_usuario: 'gestor',
          camara_id: camara.id,
          organization_id: camara.id,
          data_renovacao: dataExpiracao.toISOString()
        }]);
      }

      // 4. Enviar E-mail de Boas-Vindas
      try {
        const welcomeEmail = emailService.templates.boasVindasGestor(gestorEmail, tempPassword, nome);
        const html = emailService.generateBaseTemplate({
          camaraNome: nome,
          destinatario: gestorEmail.split('@')[0],
          assunto: welcomeEmail.assunto,
          corpo: welcomeEmail.corpo,
          linkAction: welcomeEmail.link
        });
        await emailService.send(gestorEmail, welcomeEmail.assunto, html);
      } catch (emailErr) {
        console.warn('[EcossistemaService] Falha ao enviar e-mail de boas-vindas:', emailErr);
      }

      return { ...camara, tempPassword };
    } catch (e: any) {
      console.error('[EcossistemaService] createCamara:', e);
      throw e;
    }
  },

  /**
   * Ativa um usuário já logado como gestor de uma nova câmara (Caminho Vendas/Checkout)
   */
  async activateExistingUserAsGestor(userId: string, nomeCamara: string, cnpj: string, planoId: string) {
    try {
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);

      const { data: camara, error: camaraError } = await supabase
        .from('camaras')
        .insert([{
          nome: nomeCamara,
          cnpj: cnpj,
          plano_id: planoId,
          data_expiracao: dataExpiracao.toISOString(),
          ativa: true
        }])
        .select()
        .single();

      if (camaraError) throw camaraError;

      const { error: perfilError } = await supabase
        .from('perfis')
        .update({
          camara_id: camara.id,
          tipo_usuario: 'gestor',
          data_renovacao: dataExpiracao.toISOString(),
          organization_id: camara.id
        })
        .eq('id', userId);

      if (perfilError) throw perfilError;

      return camara;
    } catch (e: any) {
      console.error('[EcossistemaService] activateExistingUserAsGestor:', e);
      throw e;
    }
  },

  async getMetrics() {
    return {
      activeAccounts: 18,
      totalMRR: 85400,
      activeUsers: 142,
      pendingInvites: 5
    };
  },

  async getRecentActivity() {
    return [
      { id: '1', camara: 'Câmara Matriz', acao: 'Processo Concluído', data: '2024-03-20T10:00:00Z' },
      { id: '2', camara: 'Câmara Sul', acao: 'Nova Afiliação', data: '2024-03-20T09:30:00Z' },
    ];
  },

  async addBonus(id: string, dias: number) {
    const { error } = await supabase.rpc('add_camara_bonus', { camara_id: id, dias_to_add: dias });
    if (error) throw error;
  },

  async toggleCamaraStatus(id: string, active: boolean) {
    const { error } = await supabase.from('camaras').update({ ativa: active }).eq('id', id);
    if (error) throw error;
  },

  async createParceiro(nome: string, categoria: string) {
    const { error } = await supabase.from('parceiros_ecossistema').insert([{ nome, categoria, status: 'Ativo' }]);
    if (error) throw error;
  }
};

export default ecossistemaService;

import { supabase } from '../lib/supabase';

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

  async createCamara(nome: string, planoId: string, gestorEmail: string, diasBonus: number = 0) {
    try {
      // 1. Gerar senha temporária: INOVA_ + Nome da Câmara sem espaços
      const sanitizedNome = nome.replace(/\s+/g, '').toUpperCase();
      const tempPassword = `INOVA_${sanitizedNome}`;

      // 2. Criar a Câmara
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      dataExpiracao.setDate(dataExpiracao.getDate() + diasBonus);

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

      if (camaraError) {
        // Fallback para Modo Mock
        if (camaraError.code === 'PGRST204' || camaraError.code === '42P01' || planoId.startsWith('00000000') || planoId.startsWith('p')) {
          return {
            id: Math.random().toString(36).substr(2, 9),
            nome,
            plano_id: planoId,
            data_expiracao: dataExpiracao.toISOString(),
            dias_bonus: diasBonus,
            ativa: true,
            created_at: new Date().toISOString(),
            tempPassword // Retorna a senha mesmo no mock
          };
        }
        throw camaraError;
      }

      // 3. Criar Usuário no Supabase Auth
      // Nota: O signUp pode enviar e-mail de confirmação dependendo da config do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: gestorEmail,
        password: tempPassword,
        options: {
          data: {
            tipo_usuario: 'gestor',
            camara_id: camara.id
          }
        }
      });

      // 4. Criar o Perfil vinculado
      const perfilData: any = {
        tipo_usuario: 'gestor',
        camara_id: camara.id,
        data_renovacao: dataExpiracao.toISOString()
      };

      // Adiciona o ID e Email se disponíveis
      if (authData.user?.id) perfilData.id = authData.user.id;
      
      // Tentativa resiliente de inserir perfil
      try {
        const { error: perfilError } = await supabase
          .from('perfis')
          .insert([perfilData]);

        if (perfilError) {
          console.warn('Aviso: Não foi possível preencher todos os campos do perfil. Verifique o schema no Supabase.', perfilError.message);
          
          // Fallback: Tentar inserir apenas o básico se falhar por colunas extras
          if (perfilError.code === 'PGRST204') {
            await supabase.from('perfis').insert([{ id: authData.user?.id, tipo_usuario: 'gestor' }]);
          }
        }
      } catch (e) {
        console.error('Erro silencioso ao criar perfil:', e);
      }

      return { ...camara, tempPassword };
    } catch (error) {
      console.error('Erro ao criar câmara:', error);
      throw error;
    }
  },

  async addBonus(camaraId: string, dias: number) {
    const { data: camara, error: fetchError } = await supabase
      .from('camaras')
      .select('data_expiracao, dias_bonus')
      .eq('id', camaraId)
      .single();

    if (fetchError) throw fetchError;

    const novaData = new Date(camara.data_expiracao);
    novaData.setDate(novaData.getDate() + dias);

    const { data, error } = await supabase
      .from('camaras')
      .update({
        data_expiracao: novaData.toISOString(),
        dias_bonus: camara.dias_bonus + dias
      })
      .eq('id', camaraId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleCamaraStatus(camaraId: string, ativa: boolean) {
    // Se for ID mockado (sem hífen), simulamos
    if (!camaraId.includes('-')) {
      console.warn('Simulando alteração de status (Modo Mock)');
      return { id: camaraId, ativa };
    }

    const { data, error } = await supabase
      .from('camaras')
      .update({ ativa })
      .eq('id', camaraId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getParceiros(): Promise<ParceiroEcossistema[]> {
    const { data, error } = await supabase
      .from('parceiros_ecossistema')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        { id: 'p1', nome: 'Silva & Associados', categoria: 'Escritório de Advocacia', status: 'Ativo' },
        { id: 'p2', nome: 'Seguros Brasil S.A.', categoria: 'Seguradora', status: 'Ativo' },
        { id: 'p3', nome: 'Banco do Futuro', categoria: 'Banco', status: 'Ativo' },
        { id: 'p4', nome: 'Prefeitura de São Paulo', categoria: 'Instituição Pública', status: 'Pendente' },
      ];
    }
    return data;
  },

  async createParceiro(nome: string, categoria: string) {
    const { data, error } = await supabase
      .from('parceiros_ecossistema')
      .insert([{ nome, categoria, status: 'Ativo' }])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') { // Tabela não existe
        return { id: Math.random().toString(), nome, categoria, status: 'Ativo' };
      }
      throw error;
    }
    return data;
  },

  async getRecentActivity() {
    try {
      const { data: camaras } = await supabase
        .from('camaras')
        .select('id, nome, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = (camaras || []).map(c => ({
        id: `act-${c.id}`,
        tipo: 'Nova Afiliação',
        descricao: `A câmara "${c.nome}" se juntou ao ecossistema.`,
        data: c.created_at,
        icone: 'Plus'
      }));

      // Adicionar atividades de parceiros
      const { data: parceiros } = await supabase
        .from('parceiros_ecossistema')
        .select('id, nome, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const partnerActivities = (parceiros || []).map(p => ({
        id: `act-p-${p.id}`,
        tipo: 'Novo Parceiro',
        descricao: `"${p.nome}" foi homologado como parceiro estratégico.`,
        data: p.created_at,
        icone: 'ShieldCheck'
      }));

      const allActivities = [...activities, ...partnerActivities];

      if (allActivities.length === 0) {
        return [
          { id: 'act-fixed-1', tipo: 'Pagamento', descricao: 'Renovação confirmada: Câmara Matriz', data: new Date().toISOString(), icone: 'CreditCard' },
          { id: 'act-fixed-2', tipo: 'Suporte', descricao: 'Novo ticket aberto: Dúvida sobre bônus', data: new Date().toISOString(), icone: 'ShieldCheck' }
        ];
      }

      return allActivities.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } catch (e) {
      return [
        { id: 'act-fixed-1', tipo: 'Pagamento', descricao: 'Renovação confirmada: Câmara Matriz', data: new Date().toISOString(), icone: 'CreditCard' },
        { id: 'act-fixed-2', tipo: 'Suporte', descricao: 'Novo ticket aberto: Dúvida sobre bônus', data: new Date().toISOString(), icone: 'ShieldCheck' }
      ];
    }
  },

  async getMetrics() {
    const contas = await this.getContas();
    const totalMrr = contas.reduce((acc, c) => acc + (c.mrr || 0), 0);
    const ativas = contas.filter(c => c.ativa).length;
    
    return {
      totalMrr,
      totalContas: contas.length,
      contasAtivas: ativas,
      crescimentoMensal: 15
    };
  }
};

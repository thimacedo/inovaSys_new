import React, { useState, useMemo } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Edit2, 
  Trash2, 
  Info,
  MapPin,
  Fingerprint
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { applyMask } from '../utils/masks';
import { isValidCPF } from '../utils/validators';
import { useTeamMembers, useUpdateUserRole, useRemoveUser } from '../presentation/hooks/useTeam';

function AddMemberForm({ onAdded, camaraId: propCamaraId, currentUserRole }: { onAdded: (password?: string) => void, camaraId?: string, currentUserRole: string }) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('assistente');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipoUsuario === 'arbitro' && !isValidCPF(cpf)) {
      showToast('Atenção: CPF inválido.', 'attention');
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar limite de usuários da câmara
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Usuário não autenticado");

      const { data: myProfile } = await supabase
        .from('perfis')
        .select('camara_id, tipo_usuario')
        .eq('id', currentUser.id)
        .single();

      const targetCamaraId = propCamaraId || myProfile?.camara_id;

      if (myProfile?.tipo_usuario !== 'gestor' && targetCamaraId) {
        const { data: camara } = await supabase
          .from('camaras')
          .select('*, planos(limite_usuarios)')
          .eq('id', targetCamaraId)
          .single();

        if (camara) {
          const { count } = await supabase
            .from('perfis')
            .select('*', { count: 'exact', head: true })
            .eq('camara_id', targetCamaraId);

          const limiteTotal = (camara.planos?.limite_usuarios || 0) + (camara.limite_usuarios_extra || 0);
          
          if (count && count >= limiteTotal) {
            showToast(`Atenção: Limite de usuários atingido (${limiteTotal}).`, 'attention');
            setLoading(false);
            return;
          }
        }
      }

      const generateSecurePassword = (): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        const array = new Uint8Array(24);
        crypto.getRandomValues(array);
        return Array.from(array, n => chars[n % chars.length]).join('');
      };

      const tempPassword = generateSecurePassword();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: tempPassword
        })
      });
      
      const json = await res.json();

      if (!res.ok) {
        if (json.msg?.includes('User already registered') || json.message?.includes('User already registered')) {
          showToast('Atenção: Este e-mail já está registrado no sistema.', 'attention');
          return;
        } else {
          throw new Error(json.msg || json.message || 'Erro ao criar usuário');
        }
      }

      if (json.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const updateData: any = {
          tipo_usuario: tipoUsuario,
          nome: nome.trim() || email.trim().split('@')[0],
          camara_id: targetCamaraId
        };

        if (tipoUsuario === 'arbitro') {
          updateData.cpf = cpf.replace(/\D/g, "");
          updateData.endereco = endereco;
        }

        const { error: updateError } = await supabase
          .from('perfis')
          .update(updateData)
          .eq('id', json.user.id);

        if (updateError) {
          await supabase.from('perfis').upsert({ id: json.user.id, ...updateData });
        }
      }

      showToast('Sucesso: Membro adicionado à equipe!', 'success');
      onAdded(tempPassword);
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao adicionar membro: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-800 space-y-3">
        <p className="font-bold flex items-center gap-2 text-blue-900">
          <Info size={20} className="text-blue-600" />
          Como funciona o acesso da equipe?
        </p>
        <p className="leading-relaxed">
          Ao adicionar o e-mail do seu colaborador aqui, o sistema criará uma conexão segura para ele. 
          <span className="block mt-2 font-medium">
            <strong className="text-blue-900">O colaborador não precisará de senha.</strong> Ele deverá acessar a página de login e clicar em <strong className="text-blue-900">"Entrar com Google"</strong> usando exatamente o mesmo e-mail cadastrado abaixo.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Nome do Colaborador/Árbitro"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail (Conta Google)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="colaborador@gmail.com"
            />
          </div>
        </div>
        
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">O que pode fazer (Acesso)</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
            >
              <option value="assistente">Assistente (Protocola e Vê Processos)</option>
              <option value="arbitro">Árbitro (Apenas Seus Processos)</option>
              <option value="admin">Administrador (Gestor da Câmara)</option>
              {currentUserRole === 'gestor' && (
                <>
                  <option value="gestor">Gestor Global (Acesso Total)</option>
                  <option value="controle">Controle Global (Criação e Leitura)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {tipoUsuario === 'arbitro' && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CPF do Árbitro</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={cpf}
                  onChange={(e) => setCpf(applyMask(e.target.value, 'doc'))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço Profissional</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button 
          type="button"
          onClick={() => {
            const closeBtn = document.querySelector('button[aria-label="Close modal"]');
            if (closeBtn instanceof HTMLElement) closeBtn.click();
          }}
          className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Processando...' : 'Adicionar Membro'}
        </button>
      </div>
    </form>
  );
}

export default function Equipe({ camaraId: propCamaraId }: { camaraId?: string }) {
  const { showToast, showConfirm, showModal } = useModal();
  const { isGlobalAdmin, isAdmin: isLocalAdmin } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = propCamaraId || currentUser?.organization_id || currentUser?.camara_id;
  if (!camaraId) return null;

  // Hooks do TanStack Query
  const { data: membrosRaw = [], isLoading } = useTeamMembers(camaraId);
  const updateRoleMutation = useUpdateUserRole();
  const removeUserMutation = useRemoveUser();

  // Memória calculada para filtragem de permissões
  const membros = useMemo(() => {
    return membrosRaw.filter(m => {
      if (isGlobalAdmin) return true;
      
      // Membros comuns só vêem a si mesmos
      if (!isLocalAdmin && m.id !== currentUser?.id) return false;

      // Admins da câmara não vêem gestores globais
      const mRole = m.tipo_usuario?.toLowerCase() || '';
      if (isLocalAdmin && !isGlobalAdmin) {
         return !['gestor', 'controle', 'god'].includes(mRole);
      }
      return true;
    });
  }, [membrosRaw, isGlobalAdmin, isLocalAdmin, currentUser]);

  const handleEditTipoUsuario = (membro: any) => {
    if (!membro?.id) return;
    const rolesPermitidas = [];
    const currentUserRole = currentUser?.tipo_usuario?.toLowerCase();

    if (currentUserRole === 'gestor' || currentUserRole === 'god') {
      rolesPermitidas.push({ value: 'gestor', label: 'Gestor Global' });
      rolesPermitidas.push({ value: 'controle', label: 'Controle Global' });
      rolesPermitidas.push({ value: 'admin', label: 'Administrador (Câmara)' });
      rolesPermitidas.push({ value: 'assistente', label: 'Assistente' });
      rolesPermitidas.push({ value: 'arbitro', label: 'Árbitro' });
    } else {
      rolesPermitidas.push({ value: 'admin', label: 'Administrador (Câmara)' });
      rolesPermitidas.push({ value: 'assistente', label: 'Assistente' });
      rolesPermitidas.push({ value: 'arbitro', label: 'Árbitro' });
    }

    showModal(
      "Alterar Nível de Acesso",
      <div className="space-y-4 p-1">
        <p className="text-sm text-slate-600">
          Alterando o nível de acesso de <strong>{membro.nome || membro.email}</strong>.
        </p>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Novo Nível</label>
          <select 
            id="new-role-select"
            defaultValue={membro.tipo_usuario}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {rolesPermitidas.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button 
            onClick={() => {
              const closeBtn = document.querySelector('button[aria-label="Close modal"]');
              if (closeBtn instanceof HTMLElement) closeBtn.click();
            }}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={updateRoleMutation.isPending}
            onClick={async () => {
              const select = document.getElementById('new-role-select') as HTMLSelectElement;
              const newRole = select.value;
              try {
                await updateRoleMutation.mutateAsync({ userId: membro.id, newRole });
                showToast("Nível de acesso atualizado!", 'success');
                const closeBtn = document.querySelector('button[aria-label="Close modal"]');
                if (closeBtn instanceof HTMLElement) closeBtn.click();
              } catch (e) {
                showToast("Erro ao atualizar permissão.", 'error');
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {updateRoleMutation.isPending ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteMembro = (id: string) => {
    if (!id) return;
    if (id === currentUser?.id) {
      showToast("Você não pode remover seu próprio acesso.", 'attention');
      return;
    }

    showConfirm(
      "Remover Membro",
      "Deseja remover este membro da equipe? O acesso será revogado.",
      async () => {
        try {
          await removeUserMutation.mutateAsync(id);
          showToast("Membro removido com sucesso!", 'success');
        } catch (e) {
          showToast("Erro ao remover membro.", 'error');
        }
      },
      "Remover"
    );
  };

  const handleAddMemberClick = () => {
    showModal(
      "Novo Membro na Equipe",
      <AddMemberForm currentUserRole={currentUser?.tipo_usuario || ''} onAdded={(tempPwd) => {
        // Invalidação do Query já tratada na mutação se houvesse uma mutação de criação separada
        // Aqui o AddMemberForm ainda usa supabase direto para signup (necessário para auth)
        // Mas a listagem recarregará se invalidarmos manualmente ou via realtime
      }} />
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            EQUIPE DA CÂMARA
          </h2>
          <p className="text-slate-500 font-medium">Gerencie o acesso e as funções dos colaboradores.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddMemberClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
          >
            <UserPlus size={18} />
            Novo Membro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando membros...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membro</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cadastro</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membros.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg">
                          {(e.nome || e.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{e.nome || e.email}</span>
                          <span className="text-xs text-slate-500">{e.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-600">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString('pt-BR') : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-100">
                        {e.tipo_usuario}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEditTipoUsuario(e)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMembro(e.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

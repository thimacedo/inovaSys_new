import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  Info,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { userService, Perfil } from '../services/userService';
import { authService } from '../services/authService';
import { auditService } from '../services/auditService';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { applyMask } from '../utils/masks';
import { isValidCPF } from '../utils/validators';

function AddMemberForm({ onAdded, camaraId: propCamaraId }: { onAdded: () => void, camaraId?: string }) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('user');
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

      if (myProfile?.tipo_usuario !== 'god' && targetCamaraId) {
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

      // 2. Criar Usuário no Auth
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
          password: Math.random().toString(36).slice(-12) + 'A1!'
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
        
        await auditService.log('ADICIONAR_MEMBRO', {
          novo_usuario_id: json.user.id,
          email: email.trim(),
          tipo_usuario: tipoUsuario,
          camara_id: targetCamaraId
        });
      }

      showToast('Sucesso: Membro adicionado à equipe!', 'success');
      onAdded();
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
              <option value="user">Usuário (Vê e edita processos)</option>
              <option value="arbitro">Árbitro (Vê apenas seus processos)</option>
              <option value="admin">Administrador (Acesso total)</option>
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
            const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
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
  const [equipe, setEquipe] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast, showConfirm, showPrompt, showModal } = useModal();

  const [currentUserRole, setCurrentUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    carregarEquipe();
  }, [propCamaraId]);

  const carregarEquipe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let role = 'user';
      let myCamaraId = propCamaraId;

      if (user) {
        setCurrentUserId(user.id);
        const profile = await userService.getProfile(user.id);
        role = profile.tipo_usuario;
        setCurrentUserRole(role);
        if (!myCamaraId) myCamaraId = profile.camara_id;
      }

      const data = await userService.getAll();
      
      const filteredData = data.filter(m => {
        const r = role?.toLowerCase();
        const mRole = m.tipo_usuario?.toLowerCase();
        
        // God vê tudo
        if (r === 'god') return true;
        
        // Outros vêem apenas membros da mesma câmara
        if (myCamaraId && m.camara_id !== myCamaraId) return false;
        
        if (r === 'admin') return mRole !== 'god';
        return m.id === user?.id;
      });

      setEquipe(filteredData);
    } catch (e: any) {
      console.error('Erro detalhado ao carregar equipe:', e);
      showToast(`Erro ao carregar equipe: ${e.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTipoUsuario = async (membro: Perfil) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const currentUserRole = await userService.getTipoUsuario(user.id);
    
    // Níveis permitidos para o usuário logado atribuir
    const rolesPermitidas = [];
    if (currentUserRole === 'god') {
      rolesPermitidas.push({ value: 'god', label: 'Super Admin (God)' });
      rolesPermitidas.push({ value: 'admin', label: 'Administrador' });
      rolesPermitidas.push({ value: 'user', label: 'Usuário Padrão' });
      rolesPermitidas.push({ value: 'arbitro', label: 'Árbitro' });
    } else if (currentUserRole === 'admin') {
      rolesPermitidas.push({ value: 'admin', label: 'Administrador' });
      rolesPermitidas.push({ value: 'user', label: 'Usuário Padrão' });
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
              const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
              if (closeBtn instanceof HTMLElement) closeBtn.click();
            }}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={async () => {
              const select = document.getElementById('new-role-select') as HTMLSelectElement;
              const newRole = select.value;
              try {
                await userService.update(membro.id, { tipo_usuario: newRole });
                showToast("Nível de acesso atualizado!", 'success');
                carregarEquipe();
                const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
                if (closeBtn instanceof HTMLElement) closeBtn.click();
              } catch (e) {
                showToast("Erro ao atualizar: " + (e as Error).message, 'error');
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteMembro = async (id: string) => {
    if (id === currentUserId) {
      showToast("Atenção: Você não pode remover seu próprio acesso.", 'attention');
      return;
    }

    showConfirm(
      "Remover Membro",
      "Tem certeza que deseja remover este membro da equipe? O acesso ao sistema será revogado.",
      async () => {
        try {
          showToast("Processando exclusão...");
          await userService.delete(id);
          showToast("Membro removido com sucesso!", 'success');
          await carregarEquipe();
        } catch (e: any) {
          console.error('Erro ao excluir membro:', e);
          showToast("Erro ao remover: " + (e.message || "Erro desconhecido"), 'error');
        }
      },
      "Remover Permanentemente"
    );
  };

  const handleAddMemberClick = () => {
    showModal(
      "Novo Membro na Equipe",
      <AddMemberForm onAdded={() => {
        carregarEquipe();
        const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
        if (closeBtn instanceof HTMLElement) closeBtn.click();
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
          <p className="text-slate-500 font-medium">Gerencie quem pode acessar o sistema e as funções de cada um.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddMemberClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Novo Membro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível de Acesso</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipe.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center font-bold text-lg transition-all shadow-inner">
                          {(e.nome || e.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{e.nome || e.email || 'Usuário'}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} />
                            {e.email}
                          </span>
                          {e.tipo_usuario === 'arbitro' && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Fingerprint size={10} />
                                CPF: {e.cpf || '---'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <MapPin size={10} />
                                {e.endereco || '---'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">
                          {new Date(e.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Início</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        e.tipo_usuario?.toLowerCase() === 'god' 
                          ? 'bg-amber-50 text-amber-700 border-amber-100' 
                          : e.tipo_usuario?.toLowerCase() === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : e.tipo_usuario?.toLowerCase() === 'arbitro'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {e.tipo_usuario?.toLowerCase() === 'god' ? 'Super Admin' : 
                         e.tipo_usuario?.toLowerCase() === 'admin' ? 'Administrador' : 
                         e.tipo_usuario?.toLowerCase() === 'arbitro' ? 'Árbitro' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEditTipoUsuario(e)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar Nível"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMembro(e.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {equipe.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Users size={48} className="opacity-20" />
                        <p className="text-sm font-medium italic">Nenhum membro da equipe encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

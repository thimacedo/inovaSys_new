import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { usePermissions } from '../hooks/usePermissions';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useTeamMembers, useUpdateUserRole, useRemoveUser } from '../presentation/hooks/useTeam';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { TeamHeader } from './team/TeamHeader';
import { TeamTable } from './team/TeamTable';
import { AddMemberForm } from './team/AddMemberForm';

export default function Equipe({ camaraId: propCamaraId }: { camaraId?: string }) {
  const { showToast, showConfirm, showModal } = useModal();
  const { isGlobalAdmin, isAdmin: isLocalAdmin } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = propCamaraId || currentUser?.organization_id || currentUser?.camara_id;

  const { data: membrosRaw = [], isLoading } = useTeamMembers(camaraId || '');
  const updateRoleMutation = useUpdateUserRole();
  const removeUserMutation = useRemoveUser();

  // 🧠 Gestão de Equipe Reestruturada (Ordenação A-Z + Agrupamento por Cargo)
  const groupedMembros = useMemo(() => {
    // 1. Filtragem por permissão (lógica original preservada)
    const filtered = membrosRaw.filter(m => {
      if (isGlobalAdmin) return true;
      if (!isLocalAdmin && m.id !== currentUser?.id) return false;
      const mRole = m.tipo_usuario?.toLowerCase() || '';
      if (isLocalAdmin && !isGlobalAdmin) return !['gestor', 'controle', 'god'].includes(mRole);
      return true;
    });

    // 2. Primeiro: Ordenação Alfabética Crescente (A-Z) por nome ou email
    const sorted = [...filtered].sort((a, b) => 
      (a.nome || a.email || '').localeCompare(b.nome || b.email || '')
    );

    // 3. Segundo: Agrupamento por Nível de Acesso (Cargo)
    return sorted.reduce((acc: Record<string, any[]>, m) => {
      const role = m.tipo_usuario || 'arbitro';
      if (!acc[role]) acc[role] = [];
      acc[role].push(m);
      return acc;
    }, {});
  }, [membrosRaw, isGlobalAdmin, isLocalAdmin, currentUser]);

  if (!camaraId) return null;

  // Mapa de Labels amigáveis para os Cargos (MD3 Style)
  const roleLabels: Record<string, string> = {
    admin: 'Administradores',
    arbitro: 'Árbitros',
    assistente: 'Assistentes',
    gestor: 'Gestores Globais',
    controle: 'Controle Interno',
    god: 'Diretoria Técnica'
  };

  const handleEditRole = (membro: any) => {
    const roles = [
      { v: 'admin', l: 'Administrador' },
      { v: 'assistente', l: 'Assistente' },
      { v: 'arbitro', l: 'Árbitro' }
    ];
    if (currentUser?.tipo_usuario === 'gestor') roles.push({ v: 'gestor', l: 'Gestor Global' });

    showModal("Alterar Acesso", (
      <div className="space-y-6 p-2">
        <p className="text-sm text-md-on-surface-variant font-medium">Defina o novo nível para <strong>{membro.nome || membro.email}</strong></p>
        <select id="role-sel" defaultValue={membro.tipo_usuario} className="h-14 w-full bg-md-surface-variant rounded-t-xl border-b-2 border-md-outline px-4 text-md-on-surface transition-colors duration-200 focus:border-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50 shadow-sm">
          {roles.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
        <div className="flex justify-end gap-3 pt-4 border-t border-md-outline/5">
          <button onClick={async () => {
            const role = (document.getElementById('role-sel') as HTMLSelectElement).value;
            await updateRoleMutation.mutateAsync({ userId: membro.id, newRole: role });
            showToast("Acesso atualizado.", 'success');
            const closeBtn = document.querySelector('button[aria-label="Close modal"]') as HTMLElement;
            closeBtn?.click();
          }} className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary hover:shadow-md hover:brightness-110">Confirmar</button>
        </div>
      </div>
    ));
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return showToast("Ação não permitida.", 'attention');
    showConfirm("Remover Membro", "O acesso será revogado imediatamente.", async () => {
      await removeUserMutation.mutateAsync(id);
      showToast("Membro removido.", 'success');
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      
      {/* 🏷️ Cabeçalho MD3 */}
      <TeamHeader 
        onAddClick={() => showModal("Novo Membro", <AddMemberForm currentUserRole={currentUser?.tipo_usuario || ''} onAdded={() => { const b = document.querySelector('button[aria-label="Close modal"]') as HTMLElement; b?.click(); }} />)} 
      />

      {/* 👥 Grupos de Equipe MD3 (Agrupamento Tonal por Cargo) */}
      {isLoading ? (
        <TeamTable membros={[]} loading={true} onEdit={handleEditRole} onDelete={handleDelete} />
      ) : Object.entries(groupedMembros).length === 0 ? (
        <TeamTable membros={[]} loading={false} onEdit={handleEditRole} onDelete={handleDelete} />
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedMembros).map(([role, members]) => (
            <div key={role} className="group/section space-y-5">
              
              {/* Cabeçalho da Seção MD3 Estilizado */}
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-md-primary rounded-full shadow-[0_0_15px_rgba(var(--md-primary-rgb),0.4)]" />
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface tracking-tight uppercase">
                      {roleLabels[role] || role}
                    </h3>
                    <p className="text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-[0.2em]">
                      Nível de Autoridade: {role}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-2 bg-md-secondary-container text-md-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-md-outline/5">
                  {members.length} {members.length === 1 ? 'Colaborador' : 'Colaboradores'}
                </div>
              </div>

              {/* Tabela do Grupo com Container MD3 Tonal */}
              <div className="bg-md-surface-variant/5 rounded-[48px] p-2 border border-md-outline/10 hover:border-md-primary/20 transition-all duration-500 shadow-sm">
                <TeamTable 
                  membros={members} 
                  loading={false} 
                  onEdit={handleEditRole} 
                  onDelete={handleDelete} 
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </motion.div>
  );
}

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

/**
 * 👥 GESTÃO DE EQUIPE INOVASYS - v4.0
 * Alinhado com os perfis: God, Vendas, Presidente, Árbitro e Assistente.
 */
export default function Equipe({ camaraId: propCamaraId }: { camaraId?: string }) {
  const { showToast, showConfirm, showModal } = useModal();
  const { isGod, isPresident, isSales } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = propCamaraId || currentUser?.organization_id || currentUser?.camara_id;

  const { data: membrosRaw = [], isLoading } = useTeamMembers(camaraId || '');
  const updateRoleMutation = useUpdateUserRole();
  const removeUserMutation = useRemoveUser();

  const groupedMembros = useMemo(() => {
    const filtered = membrosRaw.filter(m => {
      if (isGod) return true;
      const mRole = m.tipo_usuario?.toLowerCase() || '';
      // Membros de câmara só veem sua própria câmara
      if (isPresident) return true; 
      return m.id === currentUser?.id;
    });

    const sorted = [...filtered].sort((a, b) => 
      (a.nome || a.email || '').localeCompare(b.nome || b.email || '')
    );

    return sorted.reduce((acc: Record<string, any[]>, m) => {
      let role = m.tipo_usuario?.toLowerCase() || 'assistente';
      // Migração de termos legados
      if (role === 'admin' || role === 'gestor') role = 'presidente';
      if (role === 'operador') role = 'assistente';
      
      if (!acc[role]) acc[role] = [];
      acc[role].push(m);
      return acc;
    }, {});
  }, [membrosRaw, isGod, isPresident, currentUser]);

  if (!camaraId) return null;

  const roleLabels: Record<string, string> = {
    god: 'Diretoria Técnica (SaaS)',
    vendas: 'Expansão Comercial',
    presidente: 'Presidência (Gestor)',
    arbitro: 'Árbitros',
    assistente: 'Assistentes Administrativos'
  };

  const handleEditRole = (membro: any) => {
    const roles = [
      { v: 'presidente', l: 'Presidente (Gestor)' },
      { v: 'arbitro', l: 'Árbitro' },
      { v: 'assistente', l: 'Assistente' }
    ];
    
    if (isGod) {
      roles.push({ v: 'vendas', l: 'Vendas' });
      roles.push({ v: 'god', l: 'God (Master)' });
    }

    showModal("Alterar Nível de Acesso", (
      <div className="space-y-6 p-2 text-center">
        <p className="text-sm text-md-on-surface-variant font-medium">Defina a nova incumbência para <strong>{membro.nome || membro.email}</strong></p>
        <select id="role-sel" defaultValue={membro.tipo_usuario} className="h-14 w-full bg-md-surface-variant rounded-2xl border-2 border-md-outline/10 px-6 text-md-on-surface focus:border-md-primary outline-none shadow-sm font-bold">
          {roles.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
        <div className="flex flex-col gap-2 pt-4 border-t border-md-outline/5">
          <button onClick={async () => {
            const role = (document.getElementById('role-sel') as HTMLSelectElement).value;
            await updateRoleMutation.mutateAsync({ userId: membro.id, newRole: role });
            showToast("Hierarquia atualizada com sucesso.", 'success');
            (document.querySelector('button[aria-label="Close modal"]') as HTMLElement)?.click();
          }} className="w-full rounded-2xl py-4 font-black uppercase tracking-widest bg-md-primary text-md-on-primary shadow-md active:scale-95 transition-all">Sincronizar Acesso</button>
        </div>
      </div>
    ));
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return showToast("Você não pode revogar seu próprio acesso.", 'attention');
    showConfirm("Revogar Acesso", "O usuário perderá o vínculo com esta Câmara imediatamente.", async () => {
      await removeUserMutation.mutateAsync(id);
      showToast("Acesso revogado.", 'success');
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      
      <TeamHeader 
        onAddClick={() => showModal("Convidar Novo Membro", <AddMemberForm currentUserRole={currentUser?.tipo_usuario || ''} onAdded={() => (document.querySelector('button[aria-label="Close modal"]') as HTMLElement)?.click()} />)} 
      />

      {isLoading ? (
        <TeamTable membros={[]} loading={true} onEdit={handleEditRole} onDelete={handleDelete} />
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedMembros).map(([role, members]) => (
            <div key={role} className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-md-primary rounded-full" />
                  <h3 className="text-lg font-black text-md-on-surface tracking-tight uppercase italic">{roleLabels[role] || role}</h3>
                </div>
                <span className="text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-widest">{members.length} Ativos</span>
              </div>

              <div className="bg-md-surface rounded-[40px] border border-md-outline/10 shadow-sm overflow-hidden">
                <TeamTable membros={members} loading={false} onEdit={handleEditRole} onDelete={handleDelete} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

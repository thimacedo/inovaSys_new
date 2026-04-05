import React, { useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useAuthStore } from '../../state/useAuthStore';

export interface UserProfileProps {
  email: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ email }) => {
  const { data: user, error, isLoading } = useUser(email);
  const { setCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, setCurrentUser]);

  if (isLoading) {
    return <div className="text-slate-500 animate-pulse">Carregando perfil...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-xl border border-red-100">Erro ao carregar perfil: {error.message}</div>;
  }

  if (!user) {
    return <div className="text-amber-500 p-4 bg-amber-50 rounded-xl border border-amber-100">Usuário não encontrado.</div>;
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Perfil do Usuário</h2>
      <div className="space-y-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ID do Sistema</span>
          <span className="text-slate-600 font-mono text-sm">{user.id}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">E-mail Principal</span>
          <span className="text-slate-600">{user.email}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Membro desde</span>
          <span className="text-slate-600">{new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <button 
        onClick={logout}
        className="mt-6 w-full px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
      >
        Encerrar Sessão Local
      </button>
    </div>
  );
};

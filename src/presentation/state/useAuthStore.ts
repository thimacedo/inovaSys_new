import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '../../core/domain/entities/Usuario';

export interface AuthState {
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: any) => void; // Mantido any temporariamente para aceitar dados do Supabase Auth antes da normalização interna
  updateOrganization: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      updateOrganization: (orgId) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, organization_id: orgId, camara_id: orgId } as Usuario : null
        }));
      },
      setCurrentUser: (user) => {
        if (!user) {
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // Normalização e Fallback de Retrocompatibilidade
        const normalizedUser = { ...user };

        if (!normalizedUser.organization_id && normalizedUser.camara_id) {
          normalizedUser.organization_id = normalizedUser.camara_id;
        }

        if (!normalizedUser.tipo_usuario) {
          normalizedUser.tipo_usuario = normalizedUser.role || normalizedUser.user_metadata?.role || 'arbitro';
        }

        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...normalizedUser } as Usuario : normalizedUser as Usuario,
          isAuthenticated: true,
        }));
      },
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  currentUser: any | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setCurrentUser: (user) => {
        if (!user) {
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // Fallback de Retrocompatibilidade (ID Organização)
        if (!user.organization_id && user.camara_id) {
          user.organization_id = user.camara_id;
        }

        // Fallback de Permissões (Evita a quebra do Sidebar se a API omitir a chave original)
        if (!user.tipo_usuario && user.role) {
          user.tipo_usuario = user.role;
        } else if (!user.tipo_usuario && user.user_metadata?.role) {
          user.tipo_usuario = user.user_metadata.role;
        }

        set((state) => ({
          // State Merging: Previne perda de dados hidratados do LocalStorage quando ocorre um background fetch
          currentUser: state.currentUser ? { ...state.currentUser, ...user } : user,
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

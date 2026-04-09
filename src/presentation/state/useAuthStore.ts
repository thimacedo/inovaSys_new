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
        // Fallback de Retrocompatibilidade:
        // Se o sistema antigo gravou 'camara_id' mas a nova arquitetura pede 'organization_id'
        if (user && !user.organization_id && user.camara_id) {
          user.organization_id = user.camara_id;
          console.log('🔄 [Auto-Heal] organization_id sincronizado a partir do camara_id');
        }
        
        set({ currentUser: user, isAuthenticated: !!user });
      },
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

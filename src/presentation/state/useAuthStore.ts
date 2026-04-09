import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserEntity {
  id: string;
  email?: string;
  organization_id?: string;
  [key: string]: any;
}

export interface AuthState {
  currentUser: UserEntity | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: UserEntity | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setCurrentUser: (user: UserEntity | null) => set({ currentUser: user, isAuthenticated: !!user }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

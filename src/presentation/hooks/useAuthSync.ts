import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../state/useAuthStore';

export function useAuthSync(): void {
  const { setCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    // Busca a sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          });
        } else {
          logout();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      }
    };

    initializeAuth();

    // Inscreve para mudanças de estado (Login, Logout, Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          });
        } else {
          logout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser, logout]);
}

import { useState, useEffect } from 'react';
import { GlobalErrorBoundary } from './presentation/ui/components/GlobalErrorBoundary';
import { useAuthSync } from './presentation/hooks/useAuthSync';
import { useAuthStore } from './presentation/state/useAuthStore';
import { userService } from './services/userService';
import { authService } from './services/authService';
import { inviteService } from './services/inviteService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PublicConsultation from './components/PublicConsultation';
import Pricing from './components/Pricing';
import Onboarding from './components/Onboarding';

function AppContent() {
  // Inicializa o listener de sincronização do Supabase -> Zustand
  useAuthSync();

  const { currentUser, setCurrentUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'auth' | 'public' | 'app' | 'pricing' | 'onboarding'>('auth');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const devLog = (...args: unknown[]) => { if (import.meta.env.DEV) console.log(...args); };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fluxo de processamento pós-autenticação e busca de perfil
  useEffect(() => {
    let mounted = true;

    const handleInitialFlow = async () => {
      // 1. Processar parâmetros da URL (Impersonation and Invites)
      const params = new URLSearchParams(window.location.search);
      const impersonate = params.get('impersonate');
      const targetCamaraId = params.get('camara_id');
      const inviteToken = params.get('token');

      let urlChanged = false;
      if (impersonate === 'true' && targetCamaraId) {
        localStorage.setItem('impersonated_camara_id', targetCamaraId);
        params.delete('impersonate');
        params.delete('camara_id');
        urlChanged = true;
      }
      if (inviteToken) {
        localStorage.setItem('pending_invite_token', inviteToken);
        params.delete('token');
        urlChanged = true;
      }
      if (urlChanged) {
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, document.title, newUrl || '/');
      }

      if (currentUser?.id) {
        try {
          // Tratar convites pendentes
          const pendingToken = localStorage.getItem('pending_invite_token');
          if (pendingToken) {
            await inviteService.acceptInvite(pendingToken).catch(console.error);
            localStorage.removeItem('pending_invite_token');
          }

          // Buscar perfil completo
          const profile = await userService.getProfile(currentUser.id);
          if (mounted) {
            setUserProfile(profile);
            setCurrentUser(profile);
            
            // Regras de Roteamento
            if (!profile || !profile.nome || !profile.cpf) {
              setView('onboarding');
            } else if (profile.tipo_usuario === 'operador') {
              setView('pricing');
            } else {
              setView('app');
            }
          }
        } catch (error: any) {
          console.error('[App] Erro ao buscar perfil:', error);
          if (mounted) {
            if (error?.code === 'PGRST116') {
              setView('onboarding');
            } else {
              setView('onboarding'); // Segurança
            }
          }
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) {
          setView('auth');
          setLoading(false);
        }
      }
    };

    handleInitialFlow();

    return () => { mounted = false; };
  }, [currentUser?.id]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('impersonated_camara_id');
      await authService.signOut();
      logout();
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    } finally {
      setUserProfile(null);
      setView('auth');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando Plataforma...</p>
        </div>
      </div>
    );
  }

  if (view === 'public') return <PublicConsultation onBack={() => setView('auth')} />;
  if (view === 'pricing') return <Pricing />;
  if (view === 'onboarding') return (
    <Onboarding 
      session={{ user: currentUser }} 
      onComplete={() => setView('app')} 
      onSignOut={handleSignOut}
    />
  );
  if (!currentUser || view === 'auth') return <Auth onPublicView={() => setView('public')} />;

  return (
    <div className="app-container">
      <Dashboard 
        session={{ user: currentUser }} 
        userProfile={userProfile} 
        onSignOut={handleSignOut} 
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}

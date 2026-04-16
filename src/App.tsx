import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { GlobalErrorBoundary } from './presentation/ui/components/GlobalErrorBoundary';
import { useAuthSync } from './presentation/hooks/useAuthSync';
import { useRealtimeSync } from './presentation/hooks/useRealtimeSync';
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
  // Inicializa a sincronização Sessão (Zustand) e Eventos (WebSockets)
  useAuthSync();
  useRealtimeSync();

  const { currentUser, setCurrentUser, logout, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'auth' | 'public' | 'app' | 'pricing' | 'onboarding'>('auth');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const handleInitialFlow = async () => {
      // Processamento de links e convites
      const params = new URLSearchParams(window.location.search);
      const impersonate = params.get('impersonate');
      const targetCamaraId = params.get('camara_id');
      const inviteToken = params.get('token');

      if (impersonate === 'true' && targetCamaraId) {
        localStorage.setItem('impersonated_camara_id', targetCamaraId);
      }
      if (inviteToken) {
        localStorage.setItem('pending_invite_token', inviteToken);
      }

      if (currentUser?.id) {
        try {
          const pendingToken = localStorage.getItem('pending_invite_token');
          if (pendingToken) {
            await inviteService.acceptInvite(pendingToken).catch(console.error);
            localStorage.removeItem('pending_invite_token');
          }

          const profile = await userService.getProfile(currentUser.id);
          if (mounted) {
            setUserProfile(profile);
            setCurrentUser(profile);
            
            if (!profile || !profile.nome || !profile.cpf) {
              setView('onboarding');
            } else if (profile.tipo_usuario === 'operador') {
              setView('pricing');
            } else {
              setView('app');
            }
          }
        } catch (error: any) {
          if (mounted) setView('onboarding');
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
  }, [currentUser?.id, setCurrentUser]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('impersonated_camara_id');
      await authService.signOut();
      logout();
      setView('auth');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando InovaSys...</p>
        </div>
      </div>
    );
  }

  if (view === 'public') return <PublicConsultation />;
  if (view === 'pricing') return <Pricing onBack={() => setView('auth')} />;
  if (view === 'onboarding') return <Onboarding session={{ user: currentUser }} onComplete={() => setView('app')} onSignOut={handleSignOut} />;
  
  if (!isAuthenticated || view === 'auth') return <Auth onPublicView={() => setView('public')} onPricingView={() => setView('pricing')} />;

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Dashboard 
        session={{ user: currentUser }} 
        userProfile={userProfile} 
        onSignOut={handleSignOut} 
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />
    </>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
      <Analytics />
    </GlobalErrorBoundary>
  );
}

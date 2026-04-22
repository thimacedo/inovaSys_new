import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { motion, AnimatePresence } from 'motion/react';
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
import { LandingPage } from './presentation/pages/Landing/LandingPage';
import { DocsLayout } from './presentation/pages/Docs/DocsLayout';

function AppContent() {
  // Inicializa a sincronização Sessão (Zustand) e Eventos (WebSockets)
  useAuthSync();
  useRealtimeSync();

  const { currentUser, setCurrentUser, logout, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'public' | 'app' | 'pricing' | 'onboarding' | 'docs'>('landing');
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
          setView('landing');
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
      setView('landing');
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

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <LandingPage onLogin={() => setView('auth')} onDocsView={() => setView('docs')} />
        </motion.div>
      )}

      {view === 'public' && (
        <motion.div
          key="public"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <PublicConsultation />
        </motion.div>
      )}

      {view === 'pricing' && (
        <motion.div
          key="pricing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Pricing onBack={() => setView('auth')} />
        </motion.div>
      )}

      {view === 'docs' && (
        <motion.div
          key="docs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <DocsLayout onBack={() => setView('landing')} />
        </motion.div>
      )}

      {view === 'onboarding' && (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Onboarding session={{ user: currentUser }} onComplete={() => setView('app')} onSignOut={handleSignOut} />
        </motion.div>
      )}

      {(view === 'auth' || (!isAuthenticated && view !== 'landing' && view !== 'public' && view !== 'pricing')) && (
        <motion.div
          key="auth"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Auth onPublicView={() => setView('public')} onPricingView={() => setView('pricing')} />
        </motion.div>
      )}

      {view === 'app' && isAuthenticated && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Toaster position="top-right" richColors closeButton />
          <Dashboard 
            session={{ user: currentUser }} 
            userProfile={userProfile} 
            onSignOut={handleSignOut} 
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          />
        </motion.div>
      )}
    </AnimatePresence>
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

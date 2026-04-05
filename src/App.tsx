import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { authService } from './services/authService';
import { userService } from './services/userService';
import { inviteService } from './services/inviteService';
import { useAuthStore } from './presentation/state/useAuthStore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PublicConsultation from './components/PublicConsultation';
import Pricing from './components/Pricing';
import Onboarding from './components/Onboarding';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'auth' | 'public' | 'app' | 'pricing' | 'onboarding'>('auth');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const setCurrentUser = useAuthStore(state => state.setCurrentUser);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const checkConfig = () => {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setConfigError('Faltam variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY). Verifique as configurações no Vercel e realize um novo deploy.');
        setLoading(false);
        return false;
      }
      return true;
    };

    if (!checkConfig()) return;

    let mounted = true;

    // 1. Processar parâmetros da URL antes de verificar a sessão
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

    // 2. Verificar sessão inicial
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message?.toLowerCase().includes('refresh token')) {
            await supabase.auth.signOut().catch(console.error);
          }
          throw error;
        }
        
        if (!mounted) return;
        setSession(initialSession);
        
        if (initialSession?.user) {
          await handlePostAuthFlow(initialSession.user.id);
        } else {
          setView('auth');
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Erro na inicialização da sessão:", err);
        if (err?.message?.toLowerCase().includes('refresh token')) {
          await supabase.auth.signOut().catch(console.error);
        }
        if (mounted) {
          setSession(null);
          setView('auth');
          setLoading(false);
        }
      }
    };

    initSession();

    // 3. Ouvir mudanças de estado de autenticação
    const { data: { subscription } } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        setUserProfile(null);
        setView('auth');
        setLoading(false);
        return;
      }

      setSession(newSession);
      
      if (event === 'SIGNED_IN') {
        if (newSession?.user) {
          setLoading(true);
          await handlePostAuthFlow(newSession.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado com sucesso');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio para rodar apenas uma vez

  const handlePostAuthFlow = async (userId: string) => {
    try {
      // Tentar consumir token de convite, se existir
      const pendingToken = localStorage.getItem('pending_invite_token');
      if (pendingToken) {
        try {
          await inviteService.acceptInvite(pendingToken);
          console.log("Convite consumido com sucesso!");
        } catch (inviteErr) {
          console.error("Falha ao consumir convite:", inviteErr);
        } finally {
          localStorage.removeItem('pending_invite_token');
        }
      }

      await fetchUserProfile(userId);
    } catch (error) {
      console.error("Erro fatal no fluxo pós-auth:", error);
      setView('auth'); // Fallback seguro
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await userService.getProfile(userId);
      setUserProfile(profile);

      if (profile) {
        setCurrentUser({
          id: profile.id,
          email: profile.email,
          organization_id: profile.org_id,
          ...profile
        });
      }

      // Regras de roteamento baseadas no perfil
      if (!profile || !profile.nome || !profile.cpf) {
        setView('onboarding');
      } else if (profile.tipo_usuario === 'operador') {
        setView('pricing'); 
      } else {
        setView('app');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // PGRST116 significa que a query .single() não retornou resultados (Perfil não existe ainda)
      if (error?.code === 'PGRST116') {
        setView('onboarding');
      } else {
        // Outros erros de banco, manda pro onboarding como segurança para não travar
        setView('onboarding');
      }
    } finally {
      setLoading(false); // GARANTIA DE SAIR DA TELA DE LOADING
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('impersonated_camara_id');
      logout();
      await authService.signOut();
      setSession(null);
      setUserProfile(null);
      setView('auth');
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    } finally {
      setLoading(false);
    }
  };

  // RENDERIZAÇÃO
  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Erro de Configuração</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {configError}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Checklist para o Desenvolvedor:</p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Verifique se as variáveis no Vercel começam com <strong>VITE_</strong></li>
              <li>Certifique-se de que o ambiente <strong>Production</strong> está marcado</li>
              <li>Realize um <strong>Redeploy</strong> após salvar as variáveis</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando Plataforma...</p>
        </div>
      </div>
    );
  }

  if (view === 'public') return <PublicConsultation onBack={() => setView('auth')} />;
  if (view === 'pricing') return <Pricing />;
  if (view === 'onboarding') return (
    <Onboarding 
      session={session} 
      onComplete={() => { setLoading(true); fetchUserProfile(session.user.id); }} 
      onSignOut={handleSignOut}
    />
  );
  if (!session || view === 'auth') return <Auth onPublicView={() => setView('public')} />;

  return <Dashboard session={session} userProfile={userProfile} onSignOut={handleSignOut} />;
}

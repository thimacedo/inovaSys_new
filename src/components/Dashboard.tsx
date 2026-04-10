import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo-inovasys.png';
import { 
  LogOut,
  ShieldCheck,
  Moon,
  Sun,
  HelpCircle,
  Menu,
  ChevronLeft
} from 'lucide-react';
import Notifications from './Notifications';
import Sidebar from './Sidebar';
import HelpCenter from './HelpCenter';
import { usePermissions } from '../hooks/usePermissions';

const ProcessList = lazy(() => import('./ProcessList'));
const NewProcess = lazy(() => import('./NewProcess'));
const Equipe = lazy(() => import('./Equipe'));
const CamaraConfig = lazy(() => import('./CamaraConfig'));
const Ecossistema = lazy(() => import('./Ecossistema'));
const ProcessDetails = lazy(() => import('./ProcessDetails'));
const Auditoria = lazy(() => import('./Auditoria'));
const TemplateManager = lazy(() => import('./TemplateManager'));
const DashboardHome = lazy(() => import('./DashboardHome'));
const FinanceiroBI = lazy(() => import('./FinanceiroBI'));
const FinanceiroManager = lazy(() => import('./FinanceiroManager'));
const CalendarView = lazy(() => import('./CalendarView'));

export default function Dashboard({ session, userProfile, onSignOut, theme, onToggleTheme }: { session: any, userProfile: any, onSignOut: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const { canManageTeam, canCreateProcess, canSeeAudit, isGlobalAdmin, isAtLeastAdmin } = usePermissions();
  const [currentView, setCurrentView] = useState('dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [camaraConfig, setCamaraConfig] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    // Verificação inicial
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    // Listener para redimensionamento da janela
    const handleResize = () => {
      // ✅ Mantém o menu SEMPRE aberto em telas grandes, independente do tempo logado
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(prev => {
          // ✅ Correção definitiva: NUNCA fecha automaticamente no desktop
          // Se o usuário fechou manualmente, respeita a escolha
          return prev === false ? false : true;
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // ✅ Proteção final: Verificação a cada 15 segundos para recuperar estado se for perdido
    const interval = setInterval(() => {
      if (window.innerWidth >= 1024 && document.visibilityState === 'visible') {
        setIsSidebarOpen(prev => {
          // Se por algum motivo ficou fechado sem ação do usuário, reabre
          return prev === false ? false : true;
        });
      }
    }, 15000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      const impersonatedId = localStorage.getItem('impersonated_camara_id');

      if (impersonatedId) {
        const { data } = await supabase.from('camaras').select('*').eq('id', impersonatedId).maybeSingle();
        if (data) {
          setCamaraConfig(data);
          return;
        }
      }

      const config = localStorage.getItem('camara_config');
      if (config) {
        setCamaraConfig(JSON.parse(config));
      } else if (userProfile?.camara_id) {
        const { data } = await supabase.from('camaras').select('*').eq('id', userProfile.camara_id).maybeSingle();
        if (data) {
          setCamaraConfig(data);
          localStorage.setItem('camara_config', JSON.stringify(data));
        }
      }
    };

    loadConfig();
    
    // ✅ Garante que o menu fica aberto sempre que a sessão for atualizada
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, [userProfile]);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
    setCurrentView('process_details');
  };

  const isImpersonating = !!localStorage.getItem('impersonated_camara_id');

  const handleExitImpersonation = () => {
    localStorage.removeItem('impersonated_camara_id');
    window.location.reload();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dash': return <DashboardHome />;
      case 'process_list': return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'novo':
        if (canCreateProcess) {
          const camaraId = localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id;
          return <NewProcess onProcessCreated={() => setCurrentView('dash')} camaraId={camaraId} />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'process_details':
        return selectedProcessId ? <ProcessDetails processId={selectedProcessId} onBack={() => setCurrentView('dash')} camaraConfig={camaraConfig} /> : <div>Selecione um processo</div>;
      case 'equipe':
        return canManageTeam ? <Equipe camaraId={localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id} /> : <DashboardHome />;
      case 'camara':
        return canManageTeam ? <CamaraConfig camaraId={localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id} /> : <DashboardHome />;
      case 'vendas':
        return isGlobalAdmin ? <Ecossistema /> : <DashboardHome />;
      case 'auditoria':
        return canSeeAudit ? <Auditoria /> : <DashboardHome />;
      case 'templates':
        return isGlobalAdmin ? <TemplateManager /> : <DashboardHome />;
      case 'financeiro':
        return isAtLeastAdmin ? <FinanceiroManager /> : <DashboardHome />;
      case 'financeiro_bi':
        return isAtLeastAdmin ? <FinanceiroBI /> : <DashboardHome />;
      case 'calendar':
        return <CalendarView />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div id="layout-shell" className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <header id="topbar" className="sticky top-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
          >
            {isSidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">
              <img src={camaraConfig?.logo || logoImg} className="h-6 w-auto object-contain brightness-0 invert" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[200px] hidden sm:inline-block">
                {camaraConfig?.nome || 'InovaSys'}
              </span>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest hidden sm:block">Painel de Gestão</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button onClick={onToggleTheme} className="p-2 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          
          <div className="w-[1px] h-8 bg-slate-200 mx-1 hidden sm:block"></div>
          
          <Notifications onSelectProcess={handleProcessSelect} />
          
          <div className="hidden md:flex flex-col items-end px-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{session?.user?.id.substring(0, 8)}...</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{(userProfile?.tipo_usuario || 'arbitro').toLowerCase()}</span>
          </div>

          <button 
            onClick={onSignOut} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          userEmail={session?.user?.email} 
          onSignOut={onSignOut} 
        />

        <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 lg:p-10 relative min-h-screen transition-all duration-300">
          <AnimatePresence mode="wait">
            {isImpersonating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="mb-8 p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex justify-between items-center shadow-xl border border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-inner ring-4 ring-amber-400/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">Modo de Visualização Ativo</p>
                    <p className="text-base font-bold">Gerenciando: <span className="text-amber-400">{camaraConfig?.nome}</span></p>
                  </div>
                </div>
                <button 
                  onClick={handleExitImpersonation} 
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm active:scale-95"
                >
                  Encerrar Visualização
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Orquestrando Módulos...</p>
            </div>
          }>
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {renderView()}
            </motion.div>
          </Suspense>

          {/* Floating Help Button */}
          <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-[100]">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHelpOpen(true)}
              className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl shadow-indigo-200 flex items-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <HelpCircle size={24} className="relative z-10" />
              <span className="relative z-10 font-bold text-sm pr-1">Central de Ajuda</span>
            </motion.button>
          </div>
        </main>
      </div>

      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}


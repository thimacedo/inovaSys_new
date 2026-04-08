import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo-inovasys.png';
import { 
  LogOut,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import Notifications from './Notifications';
import Sidebar from './Sidebar';
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

export default function Dashboard({ session, userProfile, onSignOut, theme, onToggleTheme }: { session: any, userProfile: any, onSignOut: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const { canManageTeam, canCreateProcess, canSeeAudit, isGlobalAdmin, isAtLeastAdmin } = usePermissions();
  const [currentView, setCurrentView] = useState('dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [camaraConfig, setCamaraConfig] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
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
      default: return <DashboardHome />;
    }
  };

  return (
    <div id="layout-shell" className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      <header id="topbar" className="sticky top-0 left-0 right-0 h-[72px] bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <img src={camaraConfig?.logo || logoImg} className="h-8 w-auto object-contain" alt="Logo" />
            <span className="font-bold text-slate-900 truncate max-w-[200px] hidden sm:inline-block">{camaraConfig?.nome || 'InovaSys'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Notifications onSelectProcess={handleProcessSelect} />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{session?.user?.email}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{(userProfile?.tipo_usuario || '').toLowerCase()}</span>
          </div>
          <button onClick={onSignOut} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sair"><LogOut size={20} /></button>
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

        <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 relative min-h-screen transition-all duration-300">
          <AnimatePresence mode="wait">
            {isImpersonating && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8 p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-lg border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-inner"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Modo de Visualização Ativo</p>
                    <p className="text-sm font-bold">Painel da Câmara: <span className="text-amber-400">{camaraConfig?.nome}</span></p>
                  </div>
                </div>
                <button onClick={handleExitImpersonation} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm">Encerrar Visualização</button>
              </motion.div>
            )}
          </AnimatePresence>

          <Suspense fallback={<div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4"><div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div><p className="text-xs font-bold uppercase tracking-widest">Preparando ambiente...</p></div>}>
            <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {renderView()}
            </motion.div>
          </Suspense>

          <div className="fixed bottom-6 right-6 flex items-center gap-2">
            <button onClick={onToggleTheme} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

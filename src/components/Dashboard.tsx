import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import HelpCenter from './HelpCenter';
import { usePermissions } from '../hooks/usePermissions';

// 🧩 Sub-módulo Layout MD3
import { Topbar } from './layout/Topbar';

const ProcessList = lazy(() => import('./ProcessList'));
const NewProcess = lazy(() => import('./NewProcess'));
const Equipe = lazy(() => import('./Equipe'));
const CamaraConfig = lazy(() => import('./CamaraConfig'));
const Ecossistema = lazy(() => import('./Ecossistema'));
const ProcessDetails = lazy(() => import('./ProcessDetails'));
const Auditoria = lazy(() => import('./Auditoria'));
const EfficiencyDashboard = lazy(() => import('./EfficiencyDashboard'));
const TemplateManager = lazy(() => import('./TemplateManager'));
const DashboardHome = lazy(() => import('./DashboardHome'));
const FinanceiroBI = lazy(() => import('./FinanceiroBI'));
const FinanceiroManager = lazy(() => import('./FinanceiroManager'));
const CalendarView = lazy(() => import('./CalendarView'));
const EmailTemplatesPage = lazy(() => import('../presentation/pages/Admin/EmailTemplatesPage'));

export default function Dashboard({ session, userProfile, onSignOut, theme, onToggleTheme }: { session: any, userProfile: any, onSignOut: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const { canManageTeam, canCreateProcess, canSeeAudit, isGlobalAdmin, isAtLeastAdmin } = usePermissions();
  const [currentView, setCurrentView] = useState('dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [camaraConfig, setCamaraConfig] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(prev => prev === false ? false : true);
    };
    
    window.addEventListener('resize', handleResize);
    
    const interval = setInterval(() => {
      if (window.innerWidth >= 1024 && document.visibilityState === 'visible') {
        setIsSidebarOpen(prev => prev === false ? false : true);
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
        if (data) { setCamaraConfig(data); return; }
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
    window.addEventListener('storage', loadConfig);
    
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    return () => window.removeEventListener('storage', loadConfig);
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
        if (canCreateProcess) return <NewProcess onProcessCreated={() => setCurrentView('dash')} camaraId={localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id} />;
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'process_details':
        return selectedProcessId ? <ProcessDetails processId={selectedProcessId!} onBack={() => { setSelectedProcessId(null); setCurrentView('dash'); }} /> : <div>Selecione um processo</div>;
      case 'equipe': return canManageTeam ? <Equipe camaraId={localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id} /> : <DashboardHome />;
      case 'camara': return canManageTeam ? <CamaraConfig camaraId={localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id} /> : <DashboardHome />;
      case 'vendas': return isGlobalAdmin ? <Ecossistema /> : <DashboardHome />;
      case 'auditoria': return canSeeAudit ? <Auditoria /> : <DashboardHome />;
      case 'efficiency_dashboard': return canSeeAudit ? <EfficiencyDashboard /> : <DashboardHome />;
      case 'templates': return isGlobalAdmin ? <TemplateManager /> : <DashboardHome />;
      case 'email_templates': return isAtLeastAdmin ? <EmailTemplatesPage /> : <DashboardHome />;
      case 'financeiro': return isAtLeastAdmin ? <FinanceiroManager /> : <DashboardHome />;
      case 'financeiro_bi': return isAtLeastAdmin ? <FinanceiroBI /> : <DashboardHome />;
      case 'calendar': return <CalendarView />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div id="layout-shell" className="flex flex-col min-h-screen bg-md-surface overflow-x-hidden relative selection:bg-md-primary-container selection:text-md-on-primary-container z-0">
      
      {/* ✨ MD3 Organic Blur Shapes (Atmosfera Visual) */}
      <div className="md-blur-shape bg-md-primary/10 w-[600px] h-[600px] -top-48 -right-48" />
      <div className="md-blur-shape bg-md-tertiary/10 w-[500px] h-[500px] top-96 -left-32" />

      {/* 🧩 Header Modular */}
      <Topbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        camaraConfig={camaraConfig}
        theme={theme}
        onToggleTheme={onToggleTheme}
        session={session}
        userProfile={userProfile}
        onSignOut={onSignOut}
        onSelectProcess={handleProcessSelect}
      />

      <div className="flex flex-1 relative">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          userEmail={session?.user?.email} 
          onSignOut={onSignOut} 
        />

        <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 relative min-h-screen transition-all duration-400 ease-[cubic-bezier(0.2,0,0,1)]">
          <AnimatePresence mode="wait">
            {isImpersonating && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="mb-8 p-6 bg-md-tertiary-container text-md-on-tertiary-container rounded-[24px] flex justify-between items-center shadow-md-1 border border-md-outline/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-md-tertiary rounded-2xl flex items-center justify-center text-md-on-tertiary shadow-sm">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Modo de Visualização (God Mode)</p>
                    <p className="text-base font-bold mt-0.5">Gerenciando: <span className="text-md-tertiary">{camaraConfig?.nome}</span></p>
                  </div>
                </div>
                <button 
                  onClick={handleExitImpersonation} 
                  className="px-6 py-3 bg-md-surface/50 hover:bg-md-surface border border-md-outline/10 text-md-on-surface rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Encerrar Visualização
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-md-surface-variant/40 border-t-md-primary rounded-full animate-spin"></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-md-on-surface-variant/60 animate-pulse">Orquestrando Interface...</p>
            </div>
          }>
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, y: 20, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            >
              {renderView()}
            </motion.div>
          </Suspense>

          {/* 🔘 Floating Action Button (FAB) MD3 */}
          <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHelpOpen(true)}
              className="bg-md-tertiary text-md-on-tertiary p-4 rounded-[20px] shadow-md-3 flex items-center gap-3 group relative overflow-hidden transition-all"
              aria-label="Central de Ajuda"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <HelpCircle size={24} className="relative z-10" />
            </motion.button>
          </div>
        </main>
      </div>

      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

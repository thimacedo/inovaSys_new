import { useState, lazy, Suspense, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, HelpCircle, Info } from 'lucide-react';
import Sidebar from './Sidebar';
import HelpCenter from './HelpCenter';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';

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
const FinancialHub = lazy(() => import('./FinancialHub'));
const CalendarView = lazy(() => import('./CalendarView'));
const EmailTemplatesPage = lazy(() => import('../presentation/pages/Admin/EmailTemplatesPage'));

export default function Dashboard({ session, userProfile, onSignOut, theme, onToggleTheme }: { session: any, userProfile: any, onSignOut: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const { currentUser } = useAuthStore();
  const { canManageTeam, canCreateProcess, canSeeAudit, isGlobalAdmin, isAtLeastAdmin } = usePermissions();
  
  // 🧭 Persistência de Navegação: Inicialização via localStorage
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('inovasys_current_view') || 'dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(() => localStorage.getItem('inovasys_selected_process_id'));
  
  const [camaraConfig, setCamaraConfig] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 🏛️ Reatividade de Unidade: Prioriza a organização selecionada no Switcher
  const activeOrgId = useMemo(() => {
    return currentUser?.organization_id || userProfile?.camara_id;
  }, [currentUser?.organization_id, userProfile?.camara_id]);

  // 🔄 Efeito de Persistência e Refinação de UX
  useEffect(() => {
    // 🧭 Log de Depuração solicitado
    console.log('🧭 Persistindo:', {view: currentView, id: selectedProcessId, org: activeOrgId});

    // Salvar estados no localStorage
    localStorage.setItem('inovasys_current_view', currentView);
    
    if (selectedProcessId) {
      localStorage.setItem('inovasys_selected_process_id', selectedProcessId);
    } else {
      localStorage.removeItem('inovasys_selected_process_id');
    }

    // 🛡️ Refinação de UX: Redirecionar se estiver em detalhes sem ID
    if (currentView === 'process_details' && !selectedProcessId) {
      setCurrentView('dash');
    }
  }, [currentView, selectedProcessId, activeOrgId]);

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
      if (activeOrgId) {
        const { data } = await supabase.from('camaras').select('*').eq('id', activeOrgId).maybeSingle();
        if (data) { 
          setCamaraConfig(data); 
          localStorage.setItem('camara_config', JSON.stringify(data));
          return; 
        }
      }
    };

    loadConfig();
  }, [activeOrgId]);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
    setCurrentView('process_details');
  };

  // Verifica se o usuário está vendo uma unidade específica sendo um administrador global (impersonation)
  const isImpersonating = useMemo(() => {
    return !!currentUser?.organization_id && currentUser.organization_id !== userProfile?.camara_id;
  }, [currentUser?.organization_id, userProfile?.camara_id]);

  const handleExitImpersonation = () => {
    const { updateOrganization } = useAuthStore.getState();
    updateOrganization(userProfile?.camara_id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dash': return <DashboardHome camaraId={activeOrgId} />;
      case 'process_list': return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} camaraId={activeOrgId} />;
      case 'novo':
        if (canCreateProcess) return <NewProcess onProcessCreated={() => setCurrentView('dash')} camaraId={activeOrgId} />;
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} camaraId={activeOrgId} />;
      case 'process_details':
        return selectedProcessId ? <ProcessDetails processId={selectedProcessId!} onBack={() => { setSelectedProcessId(null); setCurrentView('dash'); }} /> : <div>Selecione um processo</div>;
      case 'equipe': return canManageTeam ? <Equipe camaraId={activeOrgId} /> : <DashboardHome camaraId={activeOrgId} />;
      case 'camara': return canManageTeam ? <CamaraConfig camaraId={activeOrgId} /> : <DashboardHome camaraId={activeOrgId} />;
      case 'vendas': return isGlobalAdmin ? <Ecossistema /> : <DashboardHome camaraId={activeOrgId} />;
      case 'auditoria': return canSeeAudit ? <Auditoria /> : <DashboardHome camaraId={activeOrgId} />;
      case 'efficiency_dashboard': return canSeeAudit ? <EfficiencyDashboard /> : <DashboardHome camaraId={activeOrgId} />;
      case 'templates': return isGlobalAdmin ? <TemplateManager /> : <DashboardHome camaraId={activeOrgId} />;
      case 'email_templates': return isAtLeastAdmin ? <EmailTemplatesPage /> : <DashboardHome camaraId={activeOrgId} />;
      case 'financial_hub': return isAtLeastAdmin ? <FinancialHub camaraId={activeOrgId} /> : <DashboardHome camaraId={activeOrgId} />;
      case 'calendar': return <CalendarView />;
      default: return <DashboardHome camaraId={activeOrgId} />;
    }
  };

  return (
    <div id="layout-shell" className={`flex flex-col min-h-screen bg-md-surface overflow-x-hidden relative selection:bg-md-primary-container selection:text-md-on-primary-container z-0 transition-all duration-500 ${isImpersonating ? 'border-[6px] border-md-tertiary' : ''}`}>
      
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
                initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -20, scale: 0.95 }} 
                className="mb-8 p-6 bg-md-tertiary-container text-md-on-tertiary-container rounded-[32px] flex justify-between items-center shadow-md-2 border border-md-tertiary/20 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-md-tertiary" />
                
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-md-tertiary rounded-[20px] flex items-center justify-center text-md-on-tertiary shadow-md rotate-3">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70">Unidade em Impersonation</p>
                      <span className="px-2 py-0.5 bg-md-tertiary text-md-on-tertiary text-[8px] font-bold rounded-full uppercase tracking-tighter">Ativo</span>
                    </div>
                    <p className="text-xl font-bold mt-0.5 tracking-tight text-md-on-tertiary-container">Gerenciando: <span className="text-md-tertiary italic">{camaraConfig?.nome}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end mr-4 text-right opacity-60">
                    <div className="flex items-center gap-1.5">
                      <Info size={12} />
                      <p className="text-[10px] font-medium tracking-wide uppercase">Visão de Administrador</p>
                    </div>
                    <p className="text-[9px]">Alterações afetam esta unidade</p>
                  </div>
                  <button 
                    onClick={handleExitImpersonation} 
                    className="px-8 py-3.5 bg-md-tertiary text-md-on-tertiary hover:bg-md-tertiary/90 border border-white/10 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 hover:shadow-lg flex items-center gap-2 group"
                  >
                    VOLTAR PARA GLOBAL
                  </button>
                </div>
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

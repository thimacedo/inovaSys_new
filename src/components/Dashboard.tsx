import { useState, lazy, Suspense, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import HelpCenter from './HelpCenter';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { Topbar } from './layout/Topbar';

// 🧩 Lazy Loading para otimização de bundle
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

import { Usuario } from '../core/domain/entities/Usuario';
import { Camara } from '../core/domain/entities/Camara';

/**
 * 🏢 DASHBOARD CENTRAL INOVASYS - v4.0
 * Orquestrador de visualizações baseado em permissões granulares.
 */
export default function Dashboard({ session, userProfile, onSignOut, theme, onToggleTheme }: { session: { user: Usuario | null }, userProfile: Usuario | null, onSignOut: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const { currentUser } = useAuthStore();
  const { 
    canManageAll, 
    canPerformSales, 
    canManageCamara, 
    canExecuteProcess, 
    canSeeAudit,
    isGod 
  } = usePermissions();
  
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('inovasys_current_view') || 'dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(() => localStorage.getItem('inovasys_selected_process_id'));
  
  const [camaraConfig, setCamaraConfig] = useState<Camara | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const activeOrgId = useMemo(() => {
    return currentUser?.organization_id || userProfile?.camara_id;
  }, [currentUser?.organization_id, userProfile?.camara_id]);

  useEffect(() => {
    localStorage.setItem('inovasys_current_view', currentView);
    if (selectedProcessId) {
      localStorage.setItem('inovasys_selected_process_id', selectedProcessId);
    } else {
      localStorage.removeItem('inovasys_selected_process_id');
    }
    if (currentView === 'process_details' && !selectedProcessId) {
      setCurrentView('dash');
    }
  }, [currentView, selectedProcessId]);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      if (activeOrgId) {
        const { data } = await supabase.from('camaras').select('*').eq('id', activeOrgId).maybeSingle();
        if (data) { 
          setCamaraConfig(data as Camara); 
          localStorage.setItem('camara_config', JSON.stringify(data));
        }
      }
    };
    loadConfig();
  }, [activeOrgId]);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
    setCurrentView('process_details');
  };

  const isImpersonating = useMemo(() => {
    return !!currentUser?.organization_id && currentUser.organization_id !== userProfile?.camara_id;
  }, [currentUser?.organization_id, userProfile?.camara_id]);

  const handleExitImpersonation = () => {
    const { updateOrganization } = useAuthStore.getState();
    updateOrganization(userProfile?.camara_id || '');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dash': return <DashboardHome />;
      case 'process_list': return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'novo':
        if (canExecuteProcess) return <NewProcess onProcessCreated={() => setCurrentView('dash')} camaraId={activeOrgId} />;
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'process_details':
        return selectedProcessId ? <ProcessDetails processId={selectedProcessId!} onBack={() => { setSelectedProcessId(null); setCurrentView('dash'); }} /> : <div>Selecione um processo</div>;
      case 'equipe': return canManageCamara ? <Equipe camaraId={activeOrgId || undefined} /> : <DashboardHome />;
      case 'camara': return canManageCamara ? <CamaraConfig camaraId={activeOrgId || undefined} /> : <DashboardHome />;
      
      // Módulo Comercial (Vendas / God)
      case 'crm': 
        return canPerformSales ? <Ecossistema /> : <DashboardHome />;
      case 'registrar_camara': 
        return canPerformSales ? <div>Interface de Cadastro de Câmara (Vendas)</div> : <DashboardHome />;
      
      case 'auditoria': return canSeeAudit ? <Auditoria /> : <DashboardHome />;
      case 'efficiency_dashboard': return canSeeAudit ? <EfficiencyDashboard /> : <DashboardHome />;
      case 'templates': return canManageAll ? <TemplateManager /> : <DashboardHome />;
      case 'email_templates': return canManageCamara ? <EmailTemplatesPage /> : <DashboardHome />;
      case 'financial_hub': return canManageCamara ? <FinancialHub /> : <DashboardHome />;
      case 'calendar': return <CalendarView />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div id="layout-shell" className={`flex flex-col min-h-screen bg-md-surface overflow-x-hidden relative z-0 transition-all duration-500 ${isImpersonating ? 'border-[6px] border-md-tertiary' : ''}`}>
      
      {/* Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="md-blur-shape bg-md-primary/5 w-[600px] h-[600px] -top-48 -right-48" />
        <div className="md-blur-shape bg-md-tertiary/5 w-[500px] h-[500px] top-96 -left-32" />
      </div>

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

        <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 relative min-h-[calc(100vh-72px)]">
          <AnimatePresence mode="wait">
            {isImpersonating && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="mb-8 p-6 bg-md-tertiary-container text-md-on-tertiary-container rounded-[32px] flex justify-between items-center shadow-md border border-md-tertiary/20"
              >
                <div className="flex items-center gap-5">
                  <ShieldCheck size={28} />
                  <div>
                    <p className="text-[10px] uppercase font-black opacity-70">Câmara em Supervisão</p>
                    <p className="text-xl font-bold tracking-tight">Gerenciando: {camaraConfig?.nome}</p>
                  </div>
                </div>
                <button 
                  onClick={handleExitImpersonation} 
                  className="px-8 py-3 bg-md-tertiary text-md-on-tertiary rounded-2xl text-xs font-black"
                >
                  SAIR DA SUPERVISÃO
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <div className="w-12 h-12 border-4 border-md-primary/10 border-t-md-primary rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-md-on-surface-variant/40 uppercase tracking-widest">Sincronizando Módulo...</p>
            </div>
          }>
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              {renderView()}
            </motion.div>
          </Suspense>

          <div className="fixed bottom-8 right-8 z-50">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHelpOpen(true)}
              className="bg-md-tertiary text-md-on-tertiary p-4 rounded-2xl shadow-lg"
            >
              <HelpCircle size={24} />
            </motion.button>
          </div>
        </main>
      </div>

      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

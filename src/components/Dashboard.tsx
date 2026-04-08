import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BaseSupabaseRepository } from '../infrastructure/database/BaseSupabaseRepository';
import logoImg from '../assets/logo-inovasys.png';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  ShieldCheck, 
  Globe, 
  UserPlus, 
  LogOut,
  Building2,
  Activity,
  Server,
  FileText,
  Files
} from 'lucide-react';
import Notifications from './Notifications';

import { usePermissions } from '../hooks/usePermissions';

const ProcessList = lazy(() => import('./ProcessList'));
const NewProcess = lazy(() => import('./NewProcess'));
const Equipe = lazy(() => import('./Equipe'));
const CamaraConfig = lazy(() => import('./CamaraConfig'));
const Ecossistema = lazy(() => import('./Ecossistema'));
const ProcessDetails = lazy(() => import('./ProcessDetails'));
const Auditoria = lazy(() => import('./Auditoria'));
const VercelManager = lazy(() => import('./VercelManager'));
const TemplateManager = lazy(() => import('./TemplateManager'));
const DashboardHome = lazy(() => import('./DashboardHome'));

export default function Dashboard({ session, userProfile, onSignOut }: { session: any, userProfile: any, onSignOut: () => void }) {
  const { isGlobalAdmin, canManageTeam, canCreateProcess, canSeeAudit, isGod } = usePermissions();
  const [currentView, setCurrentView] = useState('dash');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [camaraConfig, setCamaraConfig] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (userProfile?.organization_id) {
      BaseSupabaseRepository.setOrgId(userProfile.organization_id);
    }
  }, [userProfile]);

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

  useEffect(() => {
    const handleStorageChange = () => {
      const config = localStorage.getItem('camara_config');
      if (config) {
        setCamaraConfig(JSON.parse(config));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      case 'dash':
        return <DashboardHome />;
      case 'process_list':
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'novo':
        if (canCreateProcess) {
          const camaraId = localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id;
          return <NewProcess onProcessCreated={() => setCurrentView('dash')} camaraId={camaraId} />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'process_details':
        return selectedProcessId ? (
          <ProcessDetails 
            processId={selectedProcessId} 
            onBack={() => setCurrentView('dash')} 
            camaraConfig={camaraConfig}
          />
        ) : <div>Selecione um processo</div>;
      case 'equipe':
        if (canManageTeam) {
          const camaraId = localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id;
          return <Equipe camaraId={camaraId} />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'camara':
        if (canManageTeam) {
          const camaraId = localStorage.getItem('impersonated_camara_id') || userProfile?.camara_id;
          return <CamaraConfig camaraId={camaraId} />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'vendas':
        if (isGlobalAdmin) {
          return <Ecossistema />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'auditoria':
        if (canSeeAudit) {
          return <Auditoria />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'vercel':
        if (isGlobalAdmin) {
          return <VercelManager />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      case 'templates':
        if (isGlobalAdmin) {
          return <TemplateManager />;
        }
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
      default:
        return <ProcessList onProcessSelect={handleProcessSelect} onNewProcess={() => setCurrentView('novo')} />;
    }
  };

  return (
    <div id="layout-shell" className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      <header id="topbar" className="sticky top-0 left-0 right-0 h-[72px] bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <img 
              src={camaraConfig?.logo || logoImg} 
              onError={(e) => { 
                if (e.currentTarget.src.includes(logoImg)) {
                  e.currentTarget.style.display = 'none'; 
                } else {
                  e.currentTarget.src = logoImg;
                }
              }}
              className="h-8 w-auto object-contain" 
              alt="Logo" 
            />
            <span className="font-bold text-slate-900 truncate max-w-[200px] hidden sm:inline-block">{camaraConfig?.nome || 'InovaSys'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Notifications onSelectProcess={handleProcessSelect} />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{session?.user?.email}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{(userProfile?.tipo_usuario || '').toLowerCase()}</span>
          </div>
          <button 
            onClick={onSignOut}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        <nav className={`w-64 bg-white border-r border-slate-200 h-[calc(100vh-72px)] flex flex-col fixed lg:sticky left-0 top-[72px] z-40 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:w-0 opacity-0'}`}>
          <div className="flex-1 px-4 py-6 space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">MENU PRINCIPAL</p>
            
            <motion.button 
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'dash' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
              onClick={() => {
                setCurrentView('dash');
                setIsSidebarOpen(false);
              }}
            >
              <LayoutDashboard size={18} className={currentView === 'dash' ? 'text-red-500' : ''} />
              <span className="text-sm">Painel de Controle</span>
            </motion.button>
            
            {canCreateProcess && (
              <motion.button 
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'novo' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                onClick={() => {
                  setCurrentView('novo');
                  setIsSidebarOpen(false);
                }}
              >
                <PlusCircle size={18} className={currentView === 'novo' ? 'text-red-500' : ''} />
                <span className="text-sm">Novo Processo</span>
              </motion.button>
            )}
            
            {canManageTeam && (
              <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 mb-2">ADMINISTRAÇÃO</p>
                
                <motion.button 
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'equipe' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                  onClick={() => {
                    setCurrentView('equipe');
                    setIsSidebarOpen(false);
                  }}
                >
                  <Users size={18} className={currentView === 'equipe' ? 'text-red-500' : ''} />
                  <span className="text-sm">Equipe da Câmara</span>
                </motion.button>

                <motion.button 
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'camara' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                  onClick={() => {
                    setCurrentView('camara');
                    setIsSidebarOpen(false);
                  }}
                >
                  <Settings size={18} className={currentView === 'camara' ? 'text-red-500' : ''} />
                  <span className="text-sm">Configurações</span>
                </motion.button>
              </>
            )}
            
            {isGlobalAdmin && (
              <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 mb-2">CORPORATIVO</p>
                <motion.button 
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'dash' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                  onClick={() => {
                    setCurrentView('dash');
                    setIsSidebarOpen(false);
                  }}
                >
                  <LayoutDashboard size={18} className={currentView === 'dash' ? 'text-blue-500' : ''} />
                  <span className="text-sm">Início</span>
                </motion.button>

                <motion.button 
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'process_list' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                  onClick={() => {
                    setCurrentView('process_list');
                    setIsSidebarOpen(false);
                  }}
                >
                  <Files size={18} className={currentView === 'process_list' ? 'text-blue-500' : ''} />
                  <span className="text-sm">Processos</span>
                </motion.button>

                <motion.button 
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'vendas' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                  onClick={() => {
                    setCurrentView('vendas');
                    setIsSidebarOpen(false);
                  }}
                >
                  <Globe size={18} className={currentView === 'vendas' ? 'text-blue-500' : ''} />
                  <span className="text-sm">Rede de Câmaras</span>
                </motion.button>
              </>
            )}

            {(canSeeAudit || isGlobalAdmin) && (
              <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 mb-2">SISTEMA</p>
                {canSeeAudit && (
                  <motion.button 
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'auditoria' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                    onClick={() => {
                      setCurrentView('auditoria');
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Activity size={18} className={currentView === 'auditoria' ? 'text-red-500' : ''} />
                    <span className="text-sm">Histórico de Ações</span>
                  </motion.button>
                )}
                {isGlobalAdmin && (
                  <motion.button 
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'vercel' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                    onClick={() => {
                      setCurrentView('vercel');
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Server size={18} className={currentView === 'vercel' ? 'text-red-500' : ''} />
                    <span className="text-sm">Status do Sistema</span>
                  </motion.button>
                )}
                {isGlobalAdmin && (
                  <motion.button 
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'templates' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                    onClick={() => {
                      setCurrentView('templates');
                      setIsSidebarOpen(false);
                    }}
                  >
                    <FileText size={18} className={currentView === 'templates' ? 'text-red-500' : ''} />
                    <span className="text-sm">Modelos de Documentos</span>
                  </motion.button>
                )}
              </>
            )}
          </div>

          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {session?.user?.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.email}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sessão Ativa</p>
              </div>
            </div>
            <button 
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 uppercase tracking-widest"
            >
              <LogOut size={16} />
              Sair do Sistema
            </button>
          </div>
        </nav>

        <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 relative min-h-screen transition-all duration-300">
          <AnimatePresence mode="wait">
            {isImpersonating && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-lg border border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-inner">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Modo de Visualização Ativo</p>
                    <p className="text-sm font-bold">Painel da Câmara: <span className="text-amber-400">{camaraConfig?.nome}</span></p>
                  </div>
                </div>
                <button 
                  onClick={handleExitImpersonation}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm"
                >
                  Encerrar Visualização
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest">Preparando ambiente...</p>
            </div>
          }>
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

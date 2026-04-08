import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  Globe, 
  LogOut,
  FileText,
  Files,
  DollarSign,
  Activity
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userEmail?: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userEmail, 
  onSignOut 
}) => {
  const { 
    isGlobalAdmin, 
    canManageTeam, 
    canCreateProcess, 
    canSeeAudit, 
    isAtLeastAdmin 
  } = usePermissions();

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <nav className={`w-64 bg-white border-r border-slate-200 h-[calc(100vh-72px)] flex flex-col fixed lg:sticky left-0 top-[72px] z-40 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:w-0 opacity-0'}`}>
      <div className="flex-1 px-4 py-6 space-y-2">
        {/* GERAL */}
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PRINCIPAL</p>
        <motion.button 
          whileHover={{ x: 4 }}
          className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'dash' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
          onClick={() => handleNavClick('dash')}
        >
          <LayoutDashboard size={18} className={currentView === 'dash' ? 'text-red-500' : ''} />
          <span className="text-sm">Início</span>
        </motion.button>

        {/* OPERACIONAL */}
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">OPERACIONAL</p>
        <motion.button 
          whileHover={{ x: 4 }}
          className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'process_list' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
          onClick={() => handleNavClick('process_list')}
        >
          <Files size={18} className={currentView === 'process_list' ? 'text-blue-500' : ''} />
          <span className="text-sm">Meus Processos</span>
        </motion.button>
        
        {canCreateProcess && (
          <motion.button 
            whileHover={{ x: 4 }}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'novo' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
            onClick={() => handleNavClick('novo')}
          >
            <PlusCircle size={18} className={currentView === 'novo' ? 'text-blue-500' : ''} />
            <span className="text-sm">Novo Processo</span>
          </motion.button>
        )}

        {/* GESTÃO E BI */}
        {(isAtLeastAdmin || canManageTeam) && (
          <>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">GESTÃO & NEGÓCIOS</p>
            {isAtLeastAdmin && (
              <div className="space-y-1">
                <motion.button 
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavClick('financeiro')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${currentView === 'financeiro' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <DollarSign size={18} className={currentView === 'financeiro' ? 'text-emerald-500' : ''} />
                  <span className="text-sm">Gestão Financeira</span>
                </motion.button>

                <motion.button 
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavClick('financeiro_bi')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${currentView === 'financeiro_bi' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Activity size={18} className={currentView === 'financeiro_bi' ? 'text-emerald-500' : ''} />
                  <span className="text-sm">BI Financeiro</span>
                </motion.button>
              </div>
            )}
            
            {canManageTeam && (
              <motion.button 
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'equipe' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                onClick={() => handleNavClick('equipe')}
              >
                <Users size={18} className={currentView === 'equipe' ? 'text-green-500' : ''} />
                <span className="text-sm">Minha Equipe</span>
              </motion.button>
            )}

            {isGlobalAdmin && (
              <motion.button 
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'templates' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                onClick={() => handleNavClick('templates')}
              >
                <FileText size={18} className={currentView === 'templates' ? 'text-purple-500' : ''} />
                <span className="text-sm">Modelos de Docs</span>
              </motion.button>
            )}
          </>
        )}

        {/* CORPORATIVO (GOD ONLY) */}
        {isGlobalAdmin && (
          <>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">REDE INOVASYS</p>
            <motion.button 
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'vendas' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
              onClick={() => handleNavClick('vendas')}
            >
              <Globe size={18} className={currentView === 'vendas' ? 'text-orange-500' : ''} />
              <span className="text-sm">Plataforma & Câmaras</span>
            </motion.button>
          </>
        )}

        {/* SISTEMA */}
        {(canSeeAudit || isGlobalAdmin || canManageTeam) && (
          <>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">SISTEMA</p>
            {canManageTeam && (
              <motion.button 
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'camara' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                onClick={() => handleNavClick('camara')}
              >
                <Settings size={18} className={currentView === 'camara' ? 'text-slate-500' : ''} />
                <span className="text-sm">Configurações</span>
              </motion.button>
            )}
            {canSeeAudit && (
              <motion.button 
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ${currentView === 'auditoria' ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`} 
                onClick={() => handleNavClick('auditoria')}
              >
                <Activity size={18} className={currentView === 'auditoria' ? 'text-slate-500' : ''} />
                <span className="text-sm">Trilha de Auditoria</span>
              </motion.button>
            )}
          </>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm mb-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userEmail?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
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
  );
};

export default Sidebar;

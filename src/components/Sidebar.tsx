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
  Activity,
  CalendarDays,
  ChevronRight,
  Mail,
  ShieldCheck
} from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { usePermissions } from '../hooks/usePermissions';
import { CamaraSwitcher } from './CamaraSwitcher';

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

  const NavItem = ({ id, icon: Icon, label, color = 'blue' }: { id: string, icon: any, label: string, color?: string }) => {
    const isActive = currentView === id;
    
    return (
      <motion.button 
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
          isActive 
            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg shadow-slate-200 dark:shadow-none' 
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
        }`} 
        onClick={() => handleNavClick(id)}
      >
        <Icon 
          size={18} 
          className={`transition-colors ${
            isActive ? `text-${color}-400` : 'group-hover:text-slate-900'
          }`} 
        />
        <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
          {label}
        </span>
        {isActive && (
          <motion.div 
            layoutId="active-nav-indicator"
            className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
          />
        )}
        <ChevronRight size={14} className={`ml-auto transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
      </motion.button>
    );
  };

  return (
    <nav className={`w-72 glass border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-72px)] flex flex-col fixed lg:sticky left-0 top-[72px] z-40 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:w-0 opacity-0'}`}>
      <div className="flex-1 px-4 py-8 space-y-8">
        
        <CamaraSwitcher />

        {/* SECTION: GERAL */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core</p>
          <NavItem id="dash" icon={LayoutDashboard} label="Início" color="red" />
        </div>

        {/* SECTION: OPERACIONAL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operacional</p>
          </div>
          <NavItem id="process_list" icon={Files} label="Meus Processos" color="blue" />
          <NavItem id="calendar" icon={CalendarDays} label="Agenda da Câmara" color="indigo" />
          
          {canCreateProcess && (
            <NavItem id="novo" icon={PlusCircle} label="Novo Processo" color="emerald" />
          )}
        </div>

        {/* SECTION: GESTÃO */}
        {(isAtLeastAdmin || canManageTeam) && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Gestão & Inteligência</p>
            {isAtLeastAdmin && (
              <>
                <NavItem id="financeiro" icon={DollarSign} label="Gestão Financeira" color="emerald" />
                <NavItem id="financeiro_bi" icon={Activity} label="BI Financeiro" color="amber" />
              </>
            )}
            
            {canManageTeam && (
              <NavItem id="equipe" icon={Users} label="Minha Equipe" color="blue" />
            )}

            {isAtLeastAdmin && (
              <NavItem id="email_templates" icon={Mail} label="Modelos de e-mail" color="cyan" />
            )}

            {isGlobalAdmin && (
              <NavItem id="templates" icon={FileText} label="Modelos de Docs" color="purple" />
            )}
          </div>
        )}

        {/* SECTION: CORPORATIVO */}
        {isGlobalAdmin && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Rede InovaSys</p>
            <NavItem id="vendas" icon={Globe} label="Plataforma & Câmaras" color="orange" />
          </div>
        )}

        {/* SECTION: SISTEMA */}
        {(canSeeAudit || isGlobalAdmin || canManageTeam) && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Sistema</p>
            {canManageTeam && (
              <NavItem id="camara" icon={Settings} label="Configurações" color="slate" />
            )}
            {canSeeAudit && (
              <>
                <NavItem id="auditoria" icon={ShieldCheck} label="Trilha de Auditoria" color="slate" />
                <NavItem id="efficiency_dashboard" icon={Activity} label="Painel de Eficiência" color="blue" />
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {userEmail?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">{userEmail}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Sessão Ativa</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 uppercase tracking-[0.15em]"
        >
          <LogOut size={16} />
          Encerrar Acesso
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

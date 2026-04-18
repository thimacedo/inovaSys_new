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
import { motion, AnimatePresence } from 'motion/react';
import { usePermissions } from '../hooks/usePermissions';
import { CamaraSwitcher } from './CamaraSwitcher';

/**
 * 🔷 INOVASYS - SIDEBAR (MATERIAL YOU MD3)
 * Redesenhada para conformidade total com superfícies tonais e indicadores de pílula.
 */

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userEmail?: string;
  onSignOut: () => void;
}

// 🧩 SUB-COMPONENTE: Item de Navegação MD3
const NavigationItem = ({ 
  id, 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  id: string, 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: (id: string) => void 
}) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(id)}
      className={`w-full group flex flex-col items-center justify-center py-2 px-2 transition-all duration-300 relative ${
        isActive ? 'text-md-on-surface' : 'text-md-on-surface-variant hover:text-md-on-surface'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* 💊 Indicador de Pílula MD3 (Atrás do Ícone) */}
      <div className="relative flex items-center justify-center w-full h-8 mb-1">
        <AnimatePresence>
          {isActive && (
            <motion.div 
              layoutId="nav-pill"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '56px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 mx-auto bg-md-primary-container rounded-full"
            />
          )}
        </AnimatePresence>
        <Icon 
          size={20} 
          className={`relative z-10 transition-colors duration-300 ${
            isActive ? 'text-md-on-primary-container' : 'group-hover:scale-110'
          }`} 
        />
      </div>
      
      <span className={`text-[11px] font-medium tracking-wide transition-all ${
        isActive ? 'font-bold' : 'opacity-80'
      }`}>
        {label}
      </span>
    </motion.button>
  );
};

// 🧩 SUB-COMPONENTE: Secção da Sidebar
const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-1 mb-6">
    <p className="px-4 text-[10px] font-bold text-md-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">
      {title}
    </p>
    <div className="grid grid-cols-1 gap-1">
      {children}
    </div>
  </div>
);

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
    <nav 
      className={`w-72 bg-md-surface-variant/20 border-r border-md-outline/10 h-[calc(100vh-72px)] flex flex-col fixed lg:sticky left-0 top-[72px] z-40 transition-all duration-400 ease-[cubic-bezier(0.2,0,0,1)] ${
        isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:w-0 opacity-0'
      }`}
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
        
        <div className="px-2 mb-8">
          <CamaraSwitcher />
        </div>

        <SidebarSection title="Core">
          <NavigationItem id="dash" icon={LayoutDashboard} label="Início" isActive={currentView === 'dash'} onClick={handleNavClick} />
        </SidebarSection>

        <SidebarSection title="Operacional">
          <NavigationItem id="process_list" icon={Files} label="Processos" isActive={currentView === 'process_list'} onClick={handleNavClick} />
          <NavigationItem id="calendar" icon={CalendarDays} label="Agenda" isActive={currentView === 'calendar'} onClick={handleNavClick} />
          {canCreateProcess && (
            <NavigationItem id="novo" icon={PlusCircle} label="Novo" isActive={currentView === 'novo'} onClick={handleNavClick} />
          )}
        </SidebarSection>

        {(isAtLeastAdmin || canManageTeam) && (
          <SidebarSection title="Gestão">
            {isAtLeastAdmin && (
              <>
                <NavigationItem id="financeiro" icon={DollarSign} label="Financeiro" isActive={currentView === 'financeiro'} onClick={handleNavClick} />
                <NavigationItem id="financeiro_bi" icon={Activity} label="BI" isActive={currentView === 'financeiro_bi'} onClick={handleNavClick} />
              </>
            )}
            {canManageTeam && <NavigationItem id="equipe" icon={Users} label="Equipe" isActive={currentView === 'equipe'} onClick={handleNavClick} />}
            {isGlobalAdmin && <NavigationItem id="templates" icon={FileText} label="Modelos" isActive={currentView === 'templates'} onClick={handleNavClick} />}
          </SidebarSection>
        )}

        {(canSeeAudit || isGlobalAdmin) && (
          <SidebarSection title="Sistema">
            {canSeeAudit && <NavigationItem id="auditoria" icon={ShieldCheck} label="Auditoria" isActive={currentView === 'auditoria'} onClick={handleNavClick} />}
            {canManageTeam && <NavigationItem id="camara" icon={Settings} label="Ajustes" isActive={currentView === 'camara'} onClick={handleNavClick} />}
          </SidebarSection>
        )}
      </div>

      {/* 👤 Perfil de Utilizador MD3 */}
      <div className="mt-auto p-4 bg-md-surface-variant/30 rounded-t-[32px] border-t border-md-outline/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-md-surface shadow-sm mb-4 border border-md-outline/5">
          <div className="w-10 h-10 rounded-full bg-md-primary flex items-center justify-center text-md-on-primary font-bold text-xs shadow-md">
            {userEmail?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-md-on-surface truncate">{userEmail}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[9px] text-md-on-surface-variant/60 font-bold uppercase tracking-widest">Sessão Ativa</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onSignOut}
          className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-secondary-container text-md-on-secondary-container hover:shadow-sm w-full py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-md-on-surface-variant/70 hover:bg-rose-100 hover:text-rose-700 transition-all"
        >
          <LogOut size={16} />
          Encerrar Acesso
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  LogOut,
  FileText,
  Files,
  DollarSign,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Building2
} from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePermissions } from '../hooks/usePermissions';
import { CamaraSwitcher } from './CamaraSwitcher';

/**
 * 🔷 INOVASYS - SIDEBAR (MATERIAL YOU MD3) - v4.1
 * Correção de estrutura JSX e alinhamento de componentes.
 */

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userEmail?: string;
  onSignOut: () => void;
}

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
    >
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
    canManageAll,
    canPerformSales,
    canManageCamara,
    canExecuteProcess,
    canInputData,
    canSeeAudit
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
    >
      <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
        
        {/* Switcher de Câmara */}
        {(canManageCamara || canManageAll) && (
          <div className="px-2 mb-8">
            <CamaraSwitcher />
          </div>
        )}

        {/* 🏢 SEÇÃO COMERCIAL */}
        {canPerformSales && (
          <SidebarSection title="Expansão">
            <NavigationItem id="crm" icon={TrendingUp} label="Vendas" isActive={currentView === 'crm'} onClick={handleNavClick} />
            <NavigationItem id="registrar_camara" icon={Building2} label="Nova Câmara" isActive={currentView === 'registrar_camara'} onClick={handleNavClick} />
          </SidebarSection>
        )}

        {/* 📈 SEÇÃO CORE */}
        <SidebarSection title="Visão Geral">
          <NavigationItem id="dash" icon={LayoutDashboard} label="Painel" isActive={currentView === 'dash'} onClick={handleNavClick} />
          {canInputData && (
            <NavigationItem id="process_list" icon={Files} label="Processos" isActive={currentView === 'process_list'} onClick={handleNavClick} />
          )}
        </SidebarSection>

        {/* ⚖️ SEÇÃO OPERACIONAL */}
        <SidebarSection title="Operação">
          <NavigationItem id="calendar" icon={CalendarDays} label="Agenda" isActive={currentView === 'calendar'} onClick={handleNavClick} />
          {canExecuteProcess && (
            <NavigationItem id="novo" icon={PlusCircle} label="Novo Caso" isActive={currentView === 'novo'} onClick={handleNavClick} />
          )}
        </SidebarSection>

        {/* ⚙️ SEÇÃO DE GESTÃO */}
        {(canManageCamara || canManageAll) && (
          <SidebarSection title="Administração">
            <NavigationItem id="financial_hub" icon={DollarSign} label="Financeiro PIX" isActive={currentView === 'financial_hub'} onClick={handleNavClick} />
            <NavigationItem id="equipe" icon={Users} label="Gestão de Equipe" isActive={currentView === 'equipe'} onClick={handleNavClick} />
            {canManageAll && (
              <NavigationItem id="templates" icon={FileText} label="Modelos SaaS" isActive={currentView === 'templates'} onClick={handleNavClick} />
            )}
          </SidebarSection>
        )}

        {/* 🛡️ SEÇÃO DE SEGURANÇA */}
        {canSeeAudit && (
          <SidebarSection title="Governança">
            <NavigationItem id="auditoria" icon={ShieldCheck} label="Logs de Auditoria" isActive={currentView === 'auditoria'} onClick={handleNavClick} />
            <NavigationItem id="camara" icon={Settings} label="Configurações" isActive={currentView === 'camara'} onClick={handleNavClick} />
          </SidebarSection>
        )}
      </div>

      {/* 👤 Rodapé de Perfil */}
      <div className="mt-auto p-4 bg-md-surface-variant/30 rounded-t-[32px] border-t border-md-outline/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-md-surface shadow-sm mb-4 border border-md-outline/5">
          <div className="w-10 h-10 rounded-full bg-md-primary flex items-center justify-center text-md-on-primary font-bold text-xs shadow-md">
            {userEmail?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-md-on-surface truncate">{userEmail}</p>
            <p className="text-[9px] text-md-on-surface-variant/60 font-bold uppercase tracking-widest">Sessão Ativa</p>
          </div>
        </div>
        
        <button 
          onClick={onSignOut}
          className="rounded-full px-6 py-2.5 font-medium flex items-center justify-center gap-2 w-full text-[10px] font-bold uppercase tracking-[0.15em] text-md-on-surface-variant/70 hover:bg-rose-100 hover:text-rose-700 transition-all"
        >
          <LogOut size={16} />
          Encerrar
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

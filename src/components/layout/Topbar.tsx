import React from 'react';
import { Menu, ChevronLeft, Moon, Sun, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../../assets/logo-inovasys.png';
import Notifications from '../Notifications';

interface TopbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  camaraConfig: any;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  session: any;
  userProfile: any;
  onSignOut: () => void;
  onSelectProcess: (id: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  camaraConfig,
  theme,
  onToggleTheme,
  session,
  userProfile,
  onSignOut,
  onSelectProcess
}) => {
  return (
    <header 
      id="topbar" 
      className="sticky top-0 left-0 right-0 h-[72px] bg-md-surface/80 backdrop-blur-md border-b border-md-outline/5 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm transition-colors duration-300"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2.5 text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-variant/20 rounded-full transition-all active:scale-95"
          aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        >
          {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="flex items-center gap-4 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 bg-md-primary rounded-[16px] shadow-md-1"
          >
            <img src={camaraConfig?.logo || logoImg} className="h-6 w-auto object-contain brightness-0 invert" alt="Logo" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-md-on-surface leading-tight truncate max-w-[200px] hidden sm:inline-block">
              {camaraConfig?.nome || 'InovaSys'}
            </span>
            <span className="text-[10px] font-black text-md-primary uppercase tracking-[0.2em] hidden sm:block">Painel de Gestão</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Toggle de Tema MD3 */}
        <div className="flex items-center bg-md-surface-variant/20 p-1 rounded-full border border-md-outline/5">
           <button 
            onClick={onToggleTheme} 
            className="p-2 text-md-on-surface-variant hover:text-md-on-surface rounded-full hover:bg-md-surface transition-all shadow-sm active:scale-95"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        
        <div className="w-[1px] h-8 bg-md-outline/10 mx-1 hidden sm:block"></div>
        
        <Notifications onSelectProcess={onSelectProcess} />
        
        <div className="hidden md:flex flex-col items-end px-3">
          <span className="text-[11px] font-bold text-md-on-surface">{session?.user?.id.substring(0, 8)}...</span>
          <span className="text-[9px] text-md-on-surface-variant/70 uppercase tracking-widest font-black">{(userProfile?.tipo_usuario || 'arbitro').toLowerCase()}</span>
        </div>

        <button 
          onClick={onSignOut} 
          className="p-2.5 text-md-on-surface-variant/60 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all active:scale-95 border border-transparent hover:border-rose-100" 
          title="Encerrar Acesso"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

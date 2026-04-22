import { useState, useEffect } from 'react';
import { Scale, ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';

const NAV_LINKS = [
  { label: 'Solução', href: '#solucao' },
  { label: 'IA Assistente', href: '#ia' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
];

export function Navbar({ onLogin, onDocsView }: { onLogin?: () => void, onDocsView?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-md-surface/90 backdrop-blur-xl shadow-md-1 border-b border-md-outline/10" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-md-primary flex items-center justify-center shadow-md-2">
            <Scale className="w-6 h-6 text-md-on-primary" />
          </div>
          <span className="text-2xl font-bold text-md-on-surface tracking-tight">InovaSys</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <a 
              key={l.href} 
              href={l.href} 
              className="text-sm font-medium text-md-on-surface-variant hover:text-md-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button 
            onClick={onDocsView}
            className="text-sm font-medium text-md-on-surface-variant hover:text-md-primary transition-colors"
          >
            Documentação
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-semibold text-md-primary hover:bg-md-primary/5 px-5 py-2.5 rounded-xl transition-all"
          >
            Entrar
          </button>
          <button 
            onClick={onLogin}
            className="inline-flex items-center gap-2 bg-md-primary hover:bg-md-primary/90 text-md-on-primary text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md-2 hover:shadow-md-3"
          >
            Solicitar Acesso <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="md:hidden p-2 text-md-on-surface-variant" 
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        className={cn(
          "md:hidden transition-all duration-300 overflow-hidden bg-md-surface",
          mobileOpen ? "max-h-[500px] border-t border-md-outline/10" : "max-h-0"
        )}
      >
        <div className="px-6 py-6 space-y-2">
          {NAV_LINKS.map(l => (
            <a 
              key={l.href} 
              href={l.href} 
              onClick={() => setMobileOpen(false)} 
              className="block px-4 py-3 text-base font-medium text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/5 rounded-2xl transition-all"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={onLogin}
              className="w-full text-center py-4 text-md-primary font-bold border border-md-primary/20 rounded-2xl"
            >
              Entrar
            </button>
            <button 
              onClick={onLogin}
              className="w-full text-center py-4 bg-md-primary text-md-on-primary font-bold rounded-2xl shadow-md-2"
            >
              Solicitar Acesso
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

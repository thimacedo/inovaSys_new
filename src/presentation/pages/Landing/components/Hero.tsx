import { ArrowRight, Sparkles, Shield, Zap, Bot, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Hero({ onAction }: { onAction?: () => void }) {
  return (
    <header className="relative min-h-screen flex items-center overflow-hidden bg-md-surface">
      {/* Background Orbs (MD3 Style) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-md-primary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-md-tertiary/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-md-secondary/5 rounded-full blur-[140px]" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'linear-gradient(var(--color-md-outline) 1px, transparent 1px), linear-gradient(90deg, var(--color-md-outline) 1px, transparent 1px)', 
            backgroundSize: '64px 64px' 
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-md-primary-container text-md-on-primary-container border border-md-primary/10 backdrop-blur-sm mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Plataforma de Gestão Arbitral com IA</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-up delay-100 text-md-on-surface">
            Gestão de processos
            <br />
            <span className="text-md-primary">arbitrais simplificada</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-md-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            Fluxos organizados, comunicação em tempo real e uma IA que assiste sem interferir.
            Tudo o que sua câmara precisa para operar com excelência.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up delay-300">
            <button 
              onClick={onAction}
              className="group inline-flex items-center gap-2 bg-md-primary hover:bg-md-primary/90 text-md-on-primary font-bold px-8 py-4 rounded-[28px] transition-all shadow-md-2 hover:shadow-md-3 hover:-translate-y-0.5"
            >
              Conheça a Solução
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#funcionalidades" 
              className="inline-flex items-center gap-2 text-md-on-surface-variant hover:text-md-on-surface font-semibold px-8 py-4 rounded-[28px] border border-md-outline/20 hover:border-md-primary/30 hover:bg-md-primary/5 transition-all"
            >
              Ver Funcionalidades
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-fade-up delay-400">
            {[
              { icon: Shield, label: 'Segurança Total' },
              { icon: Zap, label: 'Tempo Real' },
              { icon: Bot, label: 'IA Assistente' },
              { icon: Users, label: 'Multi-usuários' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 text-md-on-surface-variant/70">
                <badge.icon className="w-4 h-4 text-md-primary/60" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-md-surface to-transparent" />
    </header>
  );
}

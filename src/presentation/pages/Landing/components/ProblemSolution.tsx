import { X, CheckCircle2 } from 'lucide-react';

export function ProblemSolution() {
  return (
    <section id="solucao" className="py-24 sm:py-32 bg-md-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-md-primary tracking-wide uppercase mb-3">A solução</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-surface leading-tight">
            Do caos ao controle total<br />
            <span className="text-md-primary">dos seus processos</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problema */}
          <div className="relative rounded-[32px] p-8 bg-md-surface-variant/30 border border-md-outline/10">
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">Sem InovaSys</div>
            <ul className="space-y-5 mt-8">
              {[
                'Processos espalhados em e-mails e pastas',
                'Prazos perdidos por falta de alerta',
                'Comunicação lenta e fragmentada',
                'Formatação manual de sentenças',
                'Sem visibilidade do andamento',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="text-md-on-surface-variant font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solução */}
          <div className="relative rounded-[32px] p-8 bg-md-primary-container/30 border border-md-primary/10">
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-md-primary-container text-md-on-primary-container text-xs font-bold uppercase tracking-wider">Com InovaSys</div>
            <ul className="space-y-5 mt-8">
              {[
                'Todos os processos centralizados em um lugar',
                'Alertas automáticos para cada prazo',
                'Chat realtime entre árbitros e partes',
                'IA que formata e revisa automaticamente',
                'Dashboard com visão completa em tempo real',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-md-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-md-primary" />
                  </div>
                  <span className="text-md-on-surface font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

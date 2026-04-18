import { FileText, Users, MessageSquare, Bot, CheckCircle2 } from 'lucide-react';

const PROCESS_STEPS = [
  { icon: FileText, label: 'Abertura', desc: 'Cadastro e distribuição automática do processo', color: 'bg-md-primary-container text-md-on-primary-container' },
  { icon: Users, label: 'Distribuição', desc: 'Designação inteligente de árbitros', color: 'bg-md-secondary-container text-md-on-secondary-container' },
  { icon: MessageSquare, label: 'Comunicação', desc: 'Chat realtime entre todas as partes', color: 'bg-md-tertiary-container text-md-on-tertiary-container' },
  { icon: Bot, label: 'Sentenças', desc: 'Assistência de IA na formatação', color: 'bg-md-primary-container text-md-on-primary-container' },
  { icon: CheckCircle2, label: 'Encerramento', desc: 'Arquivamento e consulta pública', color: 'bg-md-secondary-container text-md-on-secondary-container' },
];

export function ProcessSteps() {
  return (
    <section id="processos" className="py-24 sm:py-32 bg-md-surface-variant/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-semibold text-md-primary tracking-wide uppercase mb-3">Gestão de Processos</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-surface leading-tight mb-5">
            Cada processo, no lugar certo,<br />
            <span className="text-md-primary">no momento certo</span>
          </h2>
          <p className="text-lg text-md-on-surface-variant max-w-2xl mx-auto">
            Acompanhe o ciclo completo de um processo arbitral — da abertura ao arquivamento — com clareza e controle totais.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.label} className="relative group">
              {/* Connector line (desktop only) */}
              {i < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-0.5 bg-md-outline/10 z-0" />
              )}
              <div className="relative bg-md-surface rounded-[28px] p-8 border border-md-outline/10 hover:border-md-primary/30 transition-all shadow-md-1 hover:shadow-md-2 text-center group-hover:-translate-y-1">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-md-primary text-md-on-primary text-xs font-bold flex items-center justify-center shadow-md-2">
                  {i + 1}
                </div>
                <div className={`w-16 h-16 rounded-[20px] ${step.color} flex items-center justify-center mx-auto mb-6 shadow-md-1 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-md-on-surface mb-2">{step.label}</h3>
                <p className="text-sm text-md-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

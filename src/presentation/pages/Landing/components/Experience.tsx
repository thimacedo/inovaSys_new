import { Search, Clock, MessageSquare, BarChart3 } from 'lucide-react';

export function Experience() {
  return (
    <section className="py-24 sm:py-32 bg-md-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[48px] overflow-hidden bg-md-on-surface p-10 sm:p-20 shadow-md-3">
          {/* Background Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-md-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-md-tertiary/15 rounded-full blur-[80px]" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-md-primary-container tracking-wide uppercase mb-4">Experiência</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-surface leading-tight mb-8">
                Simples de usar.<br />
                <span className="text-md-primary-container">Poderoso de verdade.</span>
              </h2>
              <p className="text-md-surface-variant leading-relaxed mb-10 text-lg">
                A InovaSys foi pensada para que árbitros e equipes administrativas possam focar no que importa: resolver conflitos. A tecnologia fica nos bastidores.
              </p>
              <div className="space-y-6">
                {[
                  { icon: Search, text: 'Busca inteligente em todos os processos' },
                  { icon: Clock, text: 'Prazos e alertas sempre visíveis' },
                  { icon: MessageSquare, text: 'Comunicação integrada e instantânea' },
                  { icon: BarChart3, text: 'Relatórios e métricas em um clique' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-md-surface/10 flex items-center justify-center group-hover:bg-md-primary transition-colors">
                      <item.icon className="w-6 h-6 text-md-primary-container" />
                    </div>
                    <span className="text-md-surface font-medium text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated UI Card (MD3 Elevation & Glass) */}
            <div className="relative">
              <div className="bg-md-surface/10 backdrop-blur-xl rounded-[32px] p-8 border border-md-surface/20 shadow-md-3 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 h-8 bg-md-surface/10 rounded-xl mx-4" />
                </div>
                
                <div className="space-y-4">
                  <div className="h-12 bg-md-surface/10 rounded-2xl flex items-center px-5">
                    <Search className="w-5 h-5 text-md-surface/40 mr-3" />
                    <span className="text-md-surface/30 text-sm">Buscar processo, árbitro ou parte...</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Proc. Sincronizados', value: '24', color: 'text-md-primary-container' },
                      { label: 'Saldo em Custas', value: 'R$ 12k', color: 'text-md-tertiary-container' },
                      { label: 'Concluídos', value: '156', color: 'text-md-secondary-container' },
                    ].map(card => (
                      <div key={card.label} className="bg-md-surface/5 rounded-2xl p-3 text-center border border-md-surface/10">
                        <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                        <div className="text-[8px] text-md-surface/50 font-bold uppercase tracking-tight mt-1 leading-tight">{card.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-md-surface/5 rounded-[24px] p-5 space-y-4 border border-md-surface/10">
                    {[
                      { title: 'Proc. 2026-0142', status: 'Aguardando', color: 'bg-md-tertiary-container text-md-on-tertiary-container', badge: 'Tribunal Sincronizado' },
                      { title: 'Proc. 2026-0138', status: 'Em instrução', color: 'bg-md-primary-container text-md-on-primary-container' },
                    ].map(proc => (
                      <div key={proc.title} className="flex items-center justify-between bg-md-surface/10 rounded-2xl px-5 py-4 transition-all hover:bg-md-surface/20">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-md-surface">{proc.title}</span>
                          {proc.badge && (
                            <span className="text-[9px] text-md-primary-container font-black uppercase tracking-tight mt-0.5">
                              {proc.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${proc.color}`}>{proc.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative accent */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-md-primary/30 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

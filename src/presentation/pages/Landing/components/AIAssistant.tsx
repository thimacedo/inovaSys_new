import { Bot, FileText, Sparkles, Zap, Shield, Send } from 'lucide-react';

export function AIAssistant() {
  return (
    <section id="ia" className="py-24 sm:py-32 bg-md-surface-variant/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-md-primary-container text-md-on-primary-container text-xs font-bold uppercase tracking-widest mb-8">
              <Bot className="w-4 h-4" />
              IA Assistente Administrativa
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-surface leading-tight mb-8">
              Sua assistente de<br />
              <span className="text-md-primary">redação arbitral</span>
            </h2>
            <p className="text-lg text-md-on-surface-variant leading-relaxed mb-10">
              A IA da InovaSys auxilia na formatação e revisão de minutas e sentenças, respeitando integralmente o conteúdo produzido pelo árbitro. Nenhuma interferência no mérito.
            </p>
            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: FileText, title: 'Formatação', desc: 'Minutas e sentenças seguindo as normas' },
                { icon: Sparkles, title: 'Revisão', desc: 'Correção gramatical em tempo real' },
                { icon: Zap, title: 'Extração', desc: 'Dados automáticos a partir dos autos' },
                { icon: Shield, title: 'Isenção', desc: 'Sem interferência em opiniões ou mérito' },
              ].map(item => (
                <div key={item.title} className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-md-surface border border-md-outline/10 flex items-center justify-center shadow-md-1">
                    <item.icon className="w-6 h-6 text-md-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-md-on-surface mb-1">{item.title}</h4>
                    <p className="text-sm text-md-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated AI Panel */}
          <div className="relative">
            <div className="bg-md-surface rounded-[40px] border border-md-outline/10 shadow-md-3 overflow-hidden">
              {/* Header */}
              <div className="bg-md-surface-variant/30 border-b border-md-outline/10 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-md-primary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-md-on-primary" />
                  </div>
                  <span className="font-bold text-md-on-surface">Assistente de Redação</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">Ativo</span>
              </div>
              
              {/* Content */}
              <div className="p-8 space-y-6">
                <div>
                  <div className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-[0.2em] mb-3">Minuta Original</div>
                  <div className="bg-md-surface-variant/10 rounded-2xl p-5 text-sm text-md-on-surface-variant leading-relaxed border border-md-outline/5">
                    <p>Em face do exposto, esta Camara arbitral resolve julgar procedente o pedido formulado pelo reconvinte, condenando a reconvinda ao pagamentos de indenização...</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-md-outline/10" />
                  <Sparkles className="w-5 h-5 text-md-primary animate-pulse" />
                  <div className="h-px flex-1 bg-md-outline/10" />
                </div>

                <div>
                  <div className="text-[10px] font-bold text-md-primary uppercase tracking-[0.2em] mb-3">Sugestão da IA</div>
                  <div className="bg-md-primary-container/20 rounded-2xl p-5 text-sm text-md-on-surface leading-relaxed border border-md-primary/10">
                    <p>Em face do exposto, esta <strong className="text-md-primary">Câmara Arbitral</strong> resolve julgar <strong className="text-md-primary">procedente</strong> o pedido formulado pelo reconvinte, condenando a reconvinda ao <strong className="text-md-primary">pagamento</strong> de indenização...</p>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Câmara Arbitral', 'Pagamento'].map(c => (
                    <span key={c} className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-md-surface-variant/20 border-t border-md-outline/10 px-8 py-5 flex items-center gap-4">
                <div className="flex-1 bg-md-surface border border-md-outline/20 rounded-2xl px-5 py-3 text-sm text-md-on-surface-variant shadow-inner">
                  Instruir a assistente...
                </div>
                <button className="w-12 h-12 rounded-2xl bg-md-primary text-md-on-primary flex items-center justify-center shadow-md-2 hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

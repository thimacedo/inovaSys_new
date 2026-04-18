import { Search, Bot, Shield, MessageSquare, LayoutDashboard, Clock } from 'lucide-react';

const FEATURES = [
  {
    icon: Search,
    title: 'Consulta Pública',
    desc: 'Acompanhamento transparente de processos para todas as partes envolvidas, com acesso seguro e rastreado.',
  },
  {
    icon: Bot,
    title: 'IA Assistente',
    desc: 'Revisão ortográfica, formatação automática de minutas e extração de dados — sem interferir no mérito.',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    desc: 'Dados protegidos com isolamento por câmara e árbitro, logs de auditoria e controle granular de acesso.',
  },
  {
    icon: MessageSquare,
    title: 'Chat Realtime',
    desc: 'Comunicação instantânea entre árbitros, partes e câmaras. Sem e-mails demorados, sem perda de informação.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Intuitivo',
    desc: 'Visão clara de prazos, andamentos e pendências. Tudo o que você precisa em um único painel.',
  },
  {
    icon: Clock,
    title: 'Gestão de Prazos',
    desc: 'Alertas automáticos e controle rigoroso de datas-limite para que nenhum prazo seja perdido.',
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-24 sm:py-32 bg-md-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-md-primary tracking-wide uppercase mb-3">Funcionalidades</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-surface leading-tight mb-5">
            Tudo o que sua câmara<br />
            <span className="text-md-primary">precisa em um só lugar</span>
          </h2>
          <p className="text-lg text-md-on-surface-variant max-w-2xl mx-auto">
            Ferramentas pensadas para simplificar o dia a dia da arbitragem, com foco total na experiência do usuário.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(feat => (
            <div key={feat.title} className="group bg-md-surface rounded-[32px] p-8 border border-md-outline/10 hover:border-md-primary/30 shadow-md-1 hover:shadow-md-2 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-md-primary/5 group-hover:bg-md-primary/10 flex items-center justify-center mb-6 transition-colors">
                <feat.icon className="w-7 h-7 text-md-primary" />
              </div>
              <h3 className="text-xl font-bold text-md-on-surface mb-3">{feat.title}</h3>
              <p className="text-md-on-surface-variant leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

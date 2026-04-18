import { Globe, Bot, Shield, FileEdit, BarChart3, Clock } from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: 'Interoperabilidade Judicial',
    desc: 'Sincronização em tempo real com tribunais via MNI/PJe. Espelhamento automático de andamentos judiciais diretamente na timeline do processo.',
  },
  {
    icon: FileEdit,
    title: 'Visual Template Editor',
    desc: 'Edição de atos processuais em "Modo Amigável" (sem HTML). Interface que simula papel real com preenchimento automático de campos dinâmicos.',
  },
  {
    icon: BarChart3,
    title: 'Financial Hub 360º',
    desc: 'Gestão de faturamento, split de honorários e Business Intelligence unificados em um painel estratégico de alta performance.',
  },
  {
    icon: Bot,
    title: 'IA Assistente Jurídica',
    desc: 'Revisão gramatical técnica, formatação automática de minutas e extração mecânica de dados dos autos para acelerar a redação.',
  },
  {
    icon: Shield,
    title: 'Compliance & Auditoria',
    desc: 'Trilha imutável de acessos e modificações com snapshots de dados. Segurança total via Row Level Security (RLS) e criptografia AES-256.',
  },
  {
    icon: Clock,
    title: 'Gestão Preditiva de Prazos',
    desc: 'Controle rigoroso de datas-limite e alertas automáticos via sistema e e-mail para que nenhum prazo processual seja ignorado.',
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-24 sm:py-32 bg-md-surface relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-md-primary-container)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-md-primary/10 text-md-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
             Inovação Institucional
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-md-on-surface leading-tight mb-6 tracking-tight">
            Tudo o que sua câmara precisa<br />
            <span className="text-md-primary">em uma única plataforma</span>
          </h2>
          <p className="text-lg text-md-on-surface-variant max-w-3xl mx-auto font-medium opacity-80 leading-relaxed">
            Combinamos segurança jurídica rigorosa com uma experiência de usuário moderna, eliminando a burocracia e acelerando a entrega de sentenças.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat, idx) => (
            <div 
              key={feat.title} 
              className="group bg-md-surface rounded-[40px] p-10 border border-md-outline/10 hover:border-md-primary/30 shadow-md-1 hover:shadow-md-3 transition-all duration-500 hover:-translate-y-2 flex flex-col items-start"
            >
              <div className="w-16 h-16 rounded-[24px] bg-md-surface-variant/30 group-hover:bg-md-primary group-hover:text-md-on-primary flex items-center justify-center mb-8 transition-all duration-500 shadow-sm group-hover:rotate-6">
                <feat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-md-on-surface mb-4 tracking-tight group-hover:text-md-primary transition-colors">{feat.title}</h3>
              <p className="text-sm text-md-on-surface-variant leading-[1.7] font-medium opacity-70 group-hover:opacity-100 transition-opacity">{feat.desc}</p>
              
              <div className="mt-8 pt-6 border-t border-md-outline/5 w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                 <span className="text-[10px] font-black uppercase tracking-widest text-md-primary">Saiba mais</span>
                 <div className="w-8 h-8 rounded-full bg-md-primary/10 flex items-center justify-center text-md-primary">
                    <Clock size={14} className="opacity-0 group-hover:opacity-100" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

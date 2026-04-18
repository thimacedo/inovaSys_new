import { Globe, CreditCard, Smartphone, Bell, ArrowRight, Scale } from 'lucide-react';

const FUTURE_ITEMS = [
  { icon: Globe, title: 'Tribunais', desc: 'Homologação judicial direta via API', status: 'Em breve' },
  { icon: CreditCard, title: 'Pagamentos', desc: 'Gateway com split de honorários', status: 'Em breve' },
  { icon: Smartphone, title: 'App Mobile', desc: 'Acompanhamento nativo de processos', status: 'Em breve' },
  { icon: Bell, title: 'WhatsApp', desc: 'Notificações via WhatsApp Business', status: 'Em breve' },
];

export function Future() {
  return (
    <section id="futuro" className="py-24 sm:py-32 bg-md-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-md-primary tracking-wide uppercase mb-3">Horizontes</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-surface leading-tight mb-5">
            O futuro da gestão arbitral<br />
            <span className="text-md-primary">está sendo construído</span>
          </h2>
          <p className="text-lg text-md-on-surface-variant max-w-2xl mx-auto">
            Estamos expandindo a plataforma com integrações que vão transformar ainda mais a experiência arbitral.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {FUTURE_ITEMS.map(item => (
            <div key={item.title} className="relative group bg-md-surface rounded-[28px] p-8 border border-md-outline/10 hover:border-md-primary/30 transition-all shadow-md-1 hover:shadow-md-2 hover:-translate-y-1">
              <div className="absolute top-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-md-tertiary-container text-md-on-tertiary-container border border-md-tertiary/10">
                  {item.status}
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-md-surface-variant/20 group-hover:bg-md-primary/10 flex items-center justify-center mb-6 transition-colors">
                <item.icon className="w-7 h-7 text-md-outline group-hover:text-md-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-md-on-surface mb-2">{item.title}</h3>
              <p className="text-sm text-md-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div id="contato" className="max-w-5xl mx-auto text-center">
          <div className="relative rounded-[48px] overflow-hidden bg-md-primary p-12 sm:p-20 shadow-md-3">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-md-primary-container/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-md-tertiary-container/20 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-md-on-primary/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-10 border border-md-on-primary/20 shadow-md-2">
                <Scale className="w-10 h-10 text-md-on-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-md-on-primary leading-tight mb-6">
                Pronto para transformar<br />a gestão arbitral?
              </h2>
              <p className="text-xl text-md-primary-container max-w-xl mx-auto mb-12 leading-relaxed font-medium">
                Solicite acesso à plataforma e descubra como a InovaSys pode simplificar os processos da sua câmara.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="group inline-flex items-center gap-3 bg-md-surface text-md-primary font-black px-10 py-5 rounded-[28px] hover:bg-md-primary-container transition-all shadow-md-3">
                  Solicitar Acesso
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#funcionalidades" className="inline-flex items-center gap-2 text-md-on-primary/80 hover:text-md-on-primary font-bold px-10 py-5 rounded-[28px] border border-md-on-primary/20 hover:border-md-on-primary/40 hover:bg-md-on-primary/5 transition-all">
                  Explorar Recursos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Scale, Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-md-on-surface text-md-surface-variant">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-[18px] bg-md-primary flex items-center justify-center shadow-md-2">
                <Scale className="w-7 h-7 text-md-on-primary" />
              </div>
              <span className="text-2xl font-black text-md-surface tracking-tight">InovaSys</span>
            </div>
            <p className="text-base leading-relaxed text-md-surface-variant/80">
              Plataforma inteligente para gestão de processos arbitrais. Tecnologia de ponta a serviço da justiça e da agilidade.
            </p>
          </div>

          {/* Links Groups */}
          <div>
            <h4 className="font-bold text-md-surface text-lg mb-6">Plataforma</h4>
            <ul className="space-y-4">
              {['Gestão de Processos', 'IA Assistente', 'Chat Realtime', 'Consultas Públicas'].map(l => (
                <li key={l}><a href="#" className="text-sm font-medium hover:text-md-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-md-surface text-lg mb-6">Recursos</h4>
            <ul className="space-y-4">
              {['Central de Ajuda', 'Documentação', 'Atualizações', 'Segurança'].map(l => (
                <li key={l}><a href="#" className="text-sm font-medium hover:text-md-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-md-surface text-lg mb-6">Empresa</h4>
            <ul className="space-y-4">
              {['Sobre Nós', 'Contato', 'Privacidade', 'Termos de Uso'].map(l => (
                <li key={l}><a href="#" className="text-sm font-medium hover:text-md-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-md-surface/10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-medium opacity-60">© {new Date().getFullYear()} InovaSys. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-md-surface/5 border border-md-surface/10">
            <Star className="w-4 h-4 text-md-primary-container" />
            <span className="text-xs font-bold uppercase tracking-wider text-md-surface/70">Plataforma de Gestão Arbitral com IA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

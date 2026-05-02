import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react'; // 🔷 Corrigido: Importado AnimatePresence
import { Book, ChevronLeft, Search, Shield, Info, Menu, X, HelpCircle, Code } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { docsService } from '../../../services/docsService';

interface DocsLayoutProps {
  onBack: () => void;
}

const ICON_MAP: Record<string, any> = {
  info: Info,
  shield: Shield,
  code: Code,
  help: HelpCircle
};

export function DocsLayout({ onBack }: DocsLayoutProps) {
  const [activeDocId, setActiveDocId] = useState('onboarding');
  const [docContent, setDocContent] = useState('Carregando...');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [availableDocs] = useState(docsService.getAvailableDocs());

  useEffect(() => {
    let mounted = true;
    const fetchContent = async () => {
      setDocContent('Carregando conteúdo...');
      const content = await docsService.loadDocContent(activeDocId);
      if (mounted) setDocContent(content);
    };
    fetchContent();
    return () => { mounted = false; };
  }, [activeDocId]);

  return (
    <div className="min-h-screen bg-md-surface flex flex-col">
      {/* Header Docs */}
      <header className="h-16 border-b border-md-outline/10 flex items-center justify-between px-6 bg-md-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-md-primary/5 rounded-full text-md-primary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-md-secondary flex items-center justify-center">
              <Book className="w-5 h-5 text-md-on-secondary" />
            </div>
            <span className="text-lg font-bold text-md-on-surface tracking-tight">Central de Ajuda</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-md-on-surface-variant/50 group-focus-within:text-md-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar manuais..."
              className="w-full bg-md-surface-container-highest/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-md-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 text-md-on-surface-variant"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "w-72 border-r border-md-outline/10 bg-md-surface-container-low transition-all duration-300",
          sidebarOpen ? "ml-0" : "-ml-72"
        )}>
          <nav className="p-4 space-y-1">
            {availableDocs.map((item) => {
              const Icon = ICON_MAP[item.icon] || Info;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDocId(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
                    activeDocId === item.id 
                      ? "bg-md-secondary-container text-md-on-secondary-container shadow-sm" 
                      : "text-md-on-surface-variant hover:bg-md-on-surface/5"
                  )}
                >
                  <Icon className="w-5 h-5 opacity-70" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-md-surface custom-scrollbar">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDocId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="prose prose-md-blue max-w-none prose-slate">
                  {/* Título do Documento Renderizado explicitamente */}
                  <h1 className="text-4xl font-black text-md-on-surface mb-6">
                    {availableDocs.find(d => d.id === activeDocId)?.label}
                  </h1>
                  
                  <div className="whitespace-pre-wrap text-md-on-surface leading-relaxed font-sans">
                    {docContent}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

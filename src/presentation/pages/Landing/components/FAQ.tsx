import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const FAQ_DATA = [
  {
    question: 'Para quem a InovaSys foi criada?',
    answer: 'Para câmaras de arbitragem, árbitros independentes e instituições que gerenciam processos arbitrais e precisam de mais agilidade, organização e segurança no dia a dia.',
  },
  {
    question: 'A IA da InovaSys toma decisões nos processos?',
    answer: 'Não. A IA atua exclusivamente como assistente de digitação e formatação — revisa ortografia, organiza minutas e extrai dados mecânicos. O conteúdo e as decisões são sempre do árbitro.',
  },
  {
    question: 'É seguro para dados sensíveis de processos?',
    answer: 'Sim. A plataforma possui isolamento de dados por câmara e árbitro, logs completos de auditoria e políticas rigorosas de controle de acesso.',
  },
  {
    question: 'Como funciona a comunicação entre as partes?',
    answer: 'Através de chat integrado em tempo real. Árbitros, advogados e partes se comunicam diretamente na plataforma, com histórico completo e seguro.',
  },
  {
    question: 'Posso acessar de qualquer dispositivo?',
    answer: 'Sim. A InovaSys é uma plataforma web responsiva, acessível de computadores, tablets e smartphones com segurança.',
  },
  {
    question: 'Quais integrações estão previstas?',
    answer: 'Estamos desenvolvendo integração com tribunais para homologação judicial, gateway de pagamento e assinatura digital via Gov.br.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div 
      className={cn(
        "bg-md-surface rounded-[24px] overflow-hidden transition-all duration-300 border border-md-outline/10 hover:border-md-primary/20 shadow-md-1",
        open && "shadow-md-2 ring-1 ring-md-primary/10"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-6 text-left gap-4"
      >
        <span className="font-bold text-md-on-surface text-lg leading-tight">{question}</span>
        <div className={cn(
          "w-8 h-8 rounded-full bg-md-primary/5 flex items-center justify-center transition-all duration-300",
          open ? "rotate-180 bg-md-primary/10" : "rotate-0"
        )}>
          <ChevronDown className="w-5 h-5 text-md-primary" />
        </div>
      </button>
      <div className={cn(
        "grid transition-all duration-500 ease-in-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <p className="px-8 pb-8 text-md-on-surface-variant leading-relaxed text-base font-medium">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-md-surface-variant/5">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-md-primary tracking-wide uppercase mb-3">Dúvidas Frequentes</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-md-on-surface">
            Perguntas & Respostas
          </h2>
        </div>
        <div className="space-y-4">
          {FAQ_DATA.map(faq => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

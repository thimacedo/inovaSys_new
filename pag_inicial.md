# 🗂️ InovaSys — Landing Page Completa

> Código-fonte completo da página de apresentação InovaSys.
> Framework: React 19 + Vite 7 + Tailwind CSS 4 + TypeScript.
> Total: ~997 linhas | 5 arquivos

---

## 📦 Dependências

```bash
npm install lucide-react clsx tailwind-merge
```

---

## 📁 Estrutura do Projeto

```
├── index.html                 ← Entry point HTML (pt-BR, meta tags, Google Fonts)
├── package.json               ← React 19, Vite 7, Tailwind 4, Lucide Icons
├── vite.config.ts             ← Single-file build, path alias @/
├── src/
│   ├── main.tsx               ← Ponto de montagem React (StrictMode)
│   ├── index.css              ← Tailwind + tema custom brand + animações + utilitários
│   ├── utils/
│   │   └── cn.ts              ← Helper clsx + tailwind-merge
│   └── App.tsx                ← Componente principal (773 linhas, página inteira)
```

---

## 📄 Arquivo 1: `index.html` (17 linhas)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InovaSys — Gestão Arbitral Inteligente</title>
    <meta name="description" content="Plataforma inteligente para gestão de processos arbitrais. Simplifique fluxos, comunique com agilidade e entregue sentenças com qualidade." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 Arquivo 2: `src/main.tsx` (11 linhas)

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 📄 Arquivo 3: `src/utils/cn.ts` (7 linhas)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 📄 Arquivo 4: `src/index.css` (189 linhas)

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-brand-50: #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;
  --color-brand-950: #1e1b4b;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Animations ── */

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(1deg); }
  66% { transform: translateY(6px) rotate(-1deg); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  animation: fade-up 0.7s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.animate-slide-right {
  animation: slide-right 0.6s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 10s ease-in-out infinite;
}

.animate-shimmer {
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}

/* Stagger delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-600 { animation-delay: 600ms; }
.delay-700 { animation-delay: 700ms; }
.delay-800 { animation-delay: 800ms; }

/* ── Scroll-triggered visibility ── */
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Custom scrollbar ── */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ── Gradient text ── */
.text-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-light {
  background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 50%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Glass effect ── */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-light {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* ── Card hover ── */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15);
}

/* ── Timeline connector ── */
.timeline-line {
  position: absolute;
  left: 23px;
  top: 48px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #c7d2fe, #e0e7ff);
}

/* ── Noise overlay ── */
.noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}
```

---

## 📄 Arquivo 5: `src/App.tsx` (773 linhas)

```tsx
import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowRight,
  Scale,
  MessageSquare,
  Shield,
  Bot,
  Search,
  Clock,
  FileText,
  Users,
  Bell,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  Zap,
  CheckCircle2,
  Sparkles,
  Globe,
  Smartphone,
  CreditCard,
  Star,
  BarChart3,
  Send,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   HOOK: Intersection Observer for scroll reveal
   ══════════════════════════════════════════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ══════════════════════════════════════════════
   COMPONENT: Animated Counter
   ══════════════════════════════════════════════ */
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal();

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ══════════════════════════════════════════════
   COMPONENT: Section wrapper with reveal
   ══════════════════════════════════════════════ */
function Section({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useReveal(0.08);
  return (
    <section id={id} ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </section>
  );
}

/* ══════════════════════════════════════════════
   COMPONENT: FAQ Accordion Item
   ══════════════════════════════════════════════ */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-300/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
      >
        <span className="font-semibold text-slate-800">{question}</span>
        <ChevronDown className={`w-5 h-5 text-brand-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-slate-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Solução', href: '#solucao' },
  { label: 'Processos', href: '#processos' },
  { label: 'IA Assistente', href: '#ia' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Futuro', href: '#futuro' },
];

const PROCESS_STEPS = [
  { icon: FileText, label: 'Abertura', desc: 'Cadastro e distribuição automática do processo', color: 'from-violet-500 to-purple-600' },
  { icon: Users, label: 'Distribuição', desc: 'Designação inteligente de árbitros', color: 'from-blue-500 to-indigo-600' },
  { icon: MessageSquare, label: 'Comunicação', desc: 'Chat realtime entre todas as partes', color: 'from-cyan-500 to-blue-600' },
  { icon: Bot, label: 'Sentenças', desc: 'Assistência de IA na formatação', color: 'from-emerald-500 to-teal-600' },
  { icon: CheckCircle2, label: 'Encerramento', desc: 'Arquivamento e consulta pública', color: 'from-amber-500 to-orange-600' },
];

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

const FUTURE_ITEMS = [
  { icon: Globe, title: 'Tribunais', desc: 'Homologação judicial direta via API', status: 'Em breve' },
  { icon: CreditCard, title: 'Pagamentos', desc: 'Gateway com split de honorários', status: 'Em breve' },
  { icon: Smartphone, title: 'App Mobile', desc: 'Acompanhamento nativo de processos', status: 'Em breve' },
  { icon: Bell, title: 'WhatsApp', desc: 'Notificações via WhatsApp Business', status: 'Em breve' },
];

/* ══════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════ */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ────────────────── NAVBAR ────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">InovaSys</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <a href="#contato" className="hidden md:inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20">
            Solicitar Acesso <ArrowRight className="w-4 h-4" />
          </a>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-600" aria-label="Menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-96 border-t border-slate-100' : 'max-h-0'}`}>
          <div className="bg-white/95 backdrop-blur-xl px-6 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                {l.label}
              </a>
            ))}
            <a href="#contato" onClick={() => setMobileOpen(false)} className="block text-center mt-2 bg-brand-600 text-white text-sm font-semibold px-5 py-3 rounded-xl">
              Solicitar Acesso
            </a>
          </div>
        </div>
      </nav>

      {/* ────────────────── HERO ────────────────── */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span className="text-sm font-medium text-brand-200">Plataforma de Gestão Arbitral com IA</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-up delay-100">
              <span className="text-white">Gestão de processos</span>
              <br />
              <span className="text-gradient-light">arbitrais simplificada</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
              Fluxos organizados, comunicação em tempo real e uma IA que assiste sem interferir.
              Tudo o que sua câmara precisa para operar com excelência.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up delay-300">
              <a href="#solucao" className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-600/25 hover:shadow-brand-500/40 hover:-translate-y-0.5">
                Conheça a Solução
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#funcionalidades" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all">
                Ver Funcionalidades
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-fade-up delay-400">
              {[
                { icon: Shield, label: 'Segurança Total' },
                { icon: Zap, label: 'Tempo Real' },
                { icon: Bot, label: 'IA Assistente' },
                { icon: Users, label: 'Multi-usuários' },
              ].map(badge => (
                <div key={badge.label} className="flex items-center gap-2 text-slate-400">
                  <badge.icon className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </header>

      {/* ────────────────── PROBLEMA → SOLUÇÃO ────────────────── */}
      <Section id="solucao" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wide uppercase mb-3">A solução</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Do caos ao controle total<br />
              <span className="text-gradient">dos seus processos</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Problema */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
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
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solução */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100">
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">Com InovaSys</div>
              <ul className="space-y-5 mt-8">
                {[
                  'Todos os processos centralizados em um lugar',
                  'Alertas automáticos para cada prazo',
                  'Chat realtime entre árbitros e partes',
                  'IA que formata e revisa automaticamente',
                  'Dashboard com visão completa em tempo real',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ────────────────── GESTÃO DE PROCESSOS (Hero Feature) ────────────────── */}
      <Section id="processos" className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wide uppercase mb-3">Gestão de Processos</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Cada processo, no lugar certo,<br />
              <span className="text-gradient">no momento certo</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Acompanhe o ciclo completo de um processo arbitral — da abertura ao arquivamento — com clareza e controle totais.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.label} className="relative group">
                {/* Connector line (desktop only) */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-300/50 transition-all card-hover text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-brand-500/30">
                    {i + 1}
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{step.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ────────────────── FUNCIONALIDADES ────────────────── */}
      <Section id="funcionalidades" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wide uppercase mb-3">Funcionalidades</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Tudo o que sua câmara<br />
              <span className="text-gradient">precisa em um só lugar</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ferramentas pensadas para simplificar o dia a dia da arbitragem, com foco total na experiência do usuário.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(feat => (
              <div key={feat.title} className="group bg-white rounded-2xl p-7 border border-slate-200 hover:border-brand-300/40 card-hover">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center mb-5 transition-colors">
                  <feat.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ────────────────── EXPERIÊNCIA DE USO ────────────────── */}
      <Section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-violet-950 p-10 sm:p-16 noise">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/15 rounded-full blur-[80px]" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block text-sm font-semibold text-brand-300 tracking-wide uppercase mb-4">Experiência</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
                  Simples de usar.<br />
                  <span className="text-gradient-light">Poderoso de verdade.</span>
                </h2>
                <p className="text-slate-300 leading-relaxed mb-8">
                  A InovaSys foi pensada para que árbitros e equipes administrativas possam focar no que importa: resolver conflitos. A tecnologia fica nos bastidores.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Search, text: 'Busca inteligente em todos os processos' },
                    { icon: Clock, text: 'Prazos e alertas sempre visíveis' },
                    { icon: MessageSquare, text: 'Comunicação integrada e instantânea' },
                    { icon: BarChart3, text: 'Relatórios e métricas em um clique' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-brand-300" />
                      </div>
                      <span className="text-slate-200 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated UI */}
              <div className="relative">
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 h-7 bg-white/10 rounded-lg mx-4" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-white/10 rounded-xl flex items-center px-4">
                      <Search className="w-4 h-4 text-white/40 mr-3" />
                      <span className="text-white/30 text-sm">Buscar processo, árbitro ou parte...</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Ativos', value: '24', color: 'text-brand-300' },
                        { label: 'Prazos Hoje', value: '3', color: 'text-amber-300' },
                        { label: 'Concluídos', value: '156', color: 'text-emerald-300' },
                      ].map(card => (
                        <div key={card.label} className="bg-white/5 rounded-xl p-3 text-center">
                          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                          <div className="text-[11px] text-white/50 mt-1">{card.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                      {[
                        { title: 'Proc. 2026-0142', status: 'Aguardando sentença', statusColor: 'text-amber-300 bg-amber-300/10' },
                        { title: 'Proc. 2026-0138', status: 'Em instrução', statusColor: 'text-blue-300 bg-blue-300/10' },
                        { title: 'Proc. 2026-0125', status: 'Concluído', statusColor: 'text-emerald-300 bg-emerald-300/10' },
                      ].map(proc => (
                        <div key={proc.title} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{proc.title}</div>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${proc.statusColor}`}>{proc.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ────────────────── IA ASSISTENTE ────────────────── */}
      <Section id="ia" className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Bot className="w-3.5 h-3.5" />
                IA Assistente Administrativa
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                Sua assistente de<br />
                <span className="text-gradient">redação arbitral</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                A IA da InovaSys auxilia na formatação e revisão de minutas e sentenças, respeitando integralmente o conteúdo produzido pelo árbitro. Nenhuma interferência no mérito.
              </p>
              <div className="space-y-5">
                {[
                  { icon: FileText, title: 'Formatação automática', desc: 'Minutas e sentenças formatadas seguindo as normas da câmara' },
                  { icon: Sparkles, title: 'Revisão ortográfica', desc: 'Correção gramatical e estilística em tempo real' },
                  { icon: Zap, title: 'Extração de dados', desc: 'Preenchimento automático de formulários a partir dos autos' },
                  { icon: Shield, title: 'Sem interferência', desc: 'A IA nunca altera conteúdo ou opiniões do árbitro' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated AI Panel */}
            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-brand-600" />
                    <span className="text-sm font-semibold text-slate-700">Assistente de Redação</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 font-medium">Ativo</span>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Minuta Original</div>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-100">
                      <p>Em face do exposto, esta Camara arbitral resolve julgar procedente o pedido formulado pelo reconvinte, condenando a reconvinda ao pagamentos de indenização...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 my-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
                  </div>
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Com Assistência IA</div>
                    <div className="bg-brand-50/50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-brand-100">
                      <p>Em face do exposto, esta <strong className="text-brand-700">Câmara Arbitral</strong> resolve julgar <strong className="text-brand-700">procedente</strong> o pedido formulado pelo reconvinte, condenando a reconvinda ao <strong className="text-brand-700">pagamento</strong> de indenização...</p>
                    </div>
                  </div>
                  {/* Corrections */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Camara → Câmara', 'pagamentos → pagamento'].map(c => (
                      <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center gap-3">
                  <input type="text" placeholder="Instruir a assistente..." className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 placeholder-slate-400" readOnly />
                  <button className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-brand-500/5 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </Section>

      {/* ────────────────── NÚMEROS ────────────────── */}
      <Section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 100, suffix: '%', label: 'Focado na experiência do usuário' },
              { value: 5, suffix: '', label: 'Etapas de gestão cobertas' },
              { value: 24, suffix: 'h', label: 'Disponibilidade da plataforma' },
              { value: 4, suffix: '+', label: 'Integrações planejadas' },
            ].map(stat => (
              <div key={stat.label} className="group">
                <div className="text-4xl sm:text-5xl font-extrabold text-gradient mb-2">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ────────────────── FUTURO ────────────────── */}
      <Section id="futuro" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wide uppercase mb-3">Horizontes</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              O futuro da gestão arbitral<br />
              <span className="text-gradient">está sendo construído</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Estamos expandindo a plataforma com integrações que vão transformar ainda mais a experiência arbitral.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FUTURE_ITEMS.map(item => (
              <div key={item.title} className="relative group bg-white rounded-2xl p-7 border border-slate-200 hover:border-brand-300/40 card-hover">
                <div className="absolute top-5 right-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    {item.status}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center mb-5 transition-colors">
                  <item.icon className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ────────────────── FAQ ────────────────── */}
      <Section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wide uppercase mb-3">Dúvidas Frequentes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Perguntas & Respostas
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_DATA.map(faq => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </Section>

      {/* ────────────────── CTA FINAL ────────────────── */}
      <Section id="contato" className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-12 sm:p-20 noise">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/20 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/20">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                Pronto para transformar<br />a gestão arbitral?
              </h2>
              <p className="text-lg text-brand-100 max-w-xl mx-auto mb-10 leading-relaxed">
                Solicite acesso à plataforma e descubra como a InovaSys pode simplificar os processos da sua câmara.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#" className="group inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl hover:bg-brand-50 transition-colors shadow-xl">
                  Solicitar Acesso
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#funcionalidades" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all">
                  Explorar Recursos
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">InovaSys</span>
              </div>
              <p className="text-sm leading-relaxed">
                Plataforma inteligente para gestão de processos arbitrais. Tecnologia a serviço da justiça.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2.5">
                {['Gestão de Processos', 'IA Assistente', 'Chat Realtime', 'Consultas Públicas'].map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2.5">
                {['Central de Ajuda', 'Documentação', 'Atualizações', 'Segurança'].map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2.5">
                {['Sobre Nós', 'Contato', 'Privacidade', 'Termos de Uso'].map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} InovaSys. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Plataforma de Gestão Arbitral com IA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## 🗺️ Mapa das Seções

| # | Seção | Linha Aprox. | Descrição |
|---|-------|-------------|-----------|
| 1 | **Navbar** | 209 | Fixa, transparente→branca on-scroll, menu mobile hamburger |
| 2 | **Hero** | 252 | Fullscreen dark, orbs animados, headline principal, trust badges |
| 3 | **Problema → Solução** | 317 | Dois cards: "Sem InovaSys" (vermelho) vs "Com InovaSys" (brand) |
| 4 | **Gestão de Processos** | 374 | 5 cards com timeline visual: Abertura → Encerramento |
| 5 | **Funcionalidades** | 413 | Grid 3×2: Consulta, IA, Segurança, Chat, Dashboard, Prazos |
| 6 | **Experiência** | 441 | Cardão dark com mockup de UI simulado (dashboard) |
| 7 | **IA Assistente** | 524 | Texto + painel simulado com "Antes/Depois" de minuta |
| 8 | **Números** | 615 | 4 contadores animados |
| 9 | **Futuro** | 636 | 4 cards "Em breve": Tribunais, Pagamentos, App, WhatsApp |
| 10 | **FAQ** | 669 | 6 perguntas com accordion animado |
| 11 | **CTA Final** | 686 | Cardão gradient com botões de ação |
| 12 | **Footer** | 718 | 4 colunas + copyright |

---

## ✅ Build & Deploy

```bash
# Instalar dependências
npm install lucide-react clsx tailwind-merge

# Build de produção
npm run build

# O arquivo final estará em: dist/index.html (single-file, tudo inline)
```

---

> *Gerado em 17/04/2026 — InovaSys Landing Page v1.0*

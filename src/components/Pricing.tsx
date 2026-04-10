import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, ArrowRight, ArrowLeft, Users, GlobeLux } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import Checkout from './Checkout';

interface PlanCardProps {
  id: string;
  name: string;
  tagline: string;
  price: number;
  users: number;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
  color: string;
  onSelect: () => void;
}

function PlanCard({ name, tagline, price, users, features, recommended, icon, color, onSelect }: PlanCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`relative p-8 rounded-3xl border flex flex-col h-full ${recommended ? 'border-indigo-200 bg-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-500/5' : 'border-slate-200 bg-white/50 backdrop-blur-sm'} transition-all`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
          Mais Utilizado
        </div>
      )}

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tagline}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-black text-slate-900">R$ {price}</span>
        <span className="text-slate-500 text-sm font-medium">/mês</span>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        <li className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
          <Users className="text-emerald-600" size={18} />
          {users} Contas de Acesso
        </li>
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-500">
            <Check className="text-emerald-500" size={18} />
            {f}
          </li>
        ))}
        <li className="pt-4 mt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Add-on Disponível</p>
          <p className="text-xs text-slate-600 font-semibold mt-1">Usuário Individual: <span className="text-indigo-600 font-black">+ R$ 180,00</span></p>
        </li>
      </ul>

      <div className="space-y-4">
        <button 
          onClick={onSelect}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
            recommended 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Iniciar Contratação
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <p className="text-[10px] text-slate-400 text-center font-medium">
          Deseja um ambiente dedicado? <button className="text-indigo-600 font-bold hover:underline">Consulte Upgrades Privados</button>
        </p>
      </div>
    </motion.div>
  );
}

export default function Pricing({ onComplete, onBack }: { onComplete?: () => void, onBack?: () => void }) {
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const { isAuthenticated } = useAuthStore();

  const plans: Omit<PlanCardProps, 'onSelect'>[] = [
    {
      id: 'starter',
      name: 'ARBITRUM',
      tagline: 'Gestão Essencial Legislativa',
      price: 499,
      users: 5,
      icon: <Zap size={28} className="text-amber-500" />,
      color: 'bg-amber-500',
      features: ['Protocolo Eletrônico Ilimitado', 'Timeline Processual Padrão', '5GB Armazenamento Nuvem', 'Notificações WhatsApp Básicas']
    },
    {
      id: 'pro',
      name: 'LEX PREMIUM',
      tagline: 'Excelência em Adjudicação',
      price: 999,
      users: 15,
      icon: <Crown size={28} className="text-indigo-600" />,
      color: 'bg-indigo-600',
      recommended: true,
      features: ['Todos os benefícios ARBITRUM', 'BI Financeiro com Conciliação', 'Área Exclusiva do Advogado', 'Templates de Termas Editáveis', '25GB Armazenamento', 'Multitenancy para Filiais']
    },
    {
      id: 'enterprise',
      name: 'PACTUM REDE',
      tagline: 'Ecossistema Jurídico Total',
      price: 2499,
      users: 50,
      icon: <Shield size={28} className="text-rose-600" />,
      color: 'bg-rose-600',
      features: ['Todos os benefícios LEX PREMIUM', 'White Label Completo', 'API de Integração Judicial', 'Auditoria Total das Partes', 'Armazenamento Ilimitado', 'Gerente de Sucesso Dedicado']
    }
  ];

  const handleSelect = (plan: any) => {
    if (!isAuthenticated) {
      if (onBack) onBack();
      return;
    }
    setSelectedPlan(plan);
  };

  if (selectedPlan) {
    return (
      <Checkout 
        plan={selectedPlan} 
        onCancel={() => setSelectedPlan(null)} 
        onSuccess={() => {
          if (onComplete) onComplete();
          else window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-100/50 to-transparent blur-3xl -z-10 opacity-60" />

      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
            <Shield className="text-white" size={28} />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">inovaSys</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Justiça Digital</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}
          {isAuthenticated && (
            <button 
              onClick={() => authService.signOut()}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
            >
              Sair da Conta
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
            Estrutura Preditiva & Legal
          </span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[0.95]">
            Sua Câmara em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Alta Performance Jurídica.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Nomenclaturas latinas para sistemas modernos. Escolha a base tecnológica da sua adjudicação privada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.id} {...plan} onSelect={() => handleSelect(plan)} />
          ))}
        </div>

        <div className="mt-28 flex flex-col items-center gap-8">
          <div className="flex items-center gap-8 px-8 py-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Confiado por</span>
            <div className="w-px h-6 bg-slate-200" />
            <img src="https://img.logo.dev/oab.org.br?token=pk_S_ZzNl9TRfK6V8M3U6_8YQ" className="h-6 opacity-30 grayscale contrast-125" alt="OAB" />
            <img src="https://img.logo.dev/tjsp.jus.br?token=pk_S_ZzNl9TRfK6V8M3U6_8YQ" className="h-6 opacity-30 grayscale contrast-125" alt="TJSP" />
          </div>
          <p className="text-sm text-slate-400 font-medium italic">
            "Transformamos a forma como câmaras de arbitragem operam no Brasil através da tecnologia LegisTech."
          </p>
        </div>
      </div>
    </div>
  );
}

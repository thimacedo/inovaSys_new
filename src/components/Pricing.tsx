import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import Checkout from './Checkout';

interface PlanCardProps {
  id: string;
  name: string;
  price: number;
  users: number;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
  color: string;
  onSelect: () => void;
}

function PlanCard({ name, price, users, features, recommended, icon, color, onSelect }: PlanCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`relative p-8 rounded-3xl border ${recommended ? 'border-indigo-200 bg-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-500/5' : 'border-slate-200 bg-white/50 backdrop-blur-sm'} transition-all`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
          Recomendado
        </div>
      )}

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-black text-slate-900">R$ {price}</span>
        <span className="text-slate-500 text-sm font-medium">/mês</span>
      </div>

      <ul className="space-y-4 mb-8">
        <li className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Check className="text-emerald-500" size={18} />
          Até {users} usuários
        </li>
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-500">
            <Check className="text-emerald-500" size={18} />
            {f}
          </li>
        ))}
      </ul>

      <button 
        onClick={onSelect}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
          recommended 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
            : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        Selecionar Plano
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

export default function Pricing({ onComplete, onBack }: { onComplete?: () => void, onBack?: () => void }) {
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const { currentUser, isAuthenticated } = useAuthStore();

  const plans: Omit<PlanCardProps, 'onSelect'>[] = [
    {
      id: 'starter',
      name: 'Câmara Pequena',
      price: 397,
      users: 5,
      icon: <Zap size={28} className="text-amber-500" />,
      color: 'bg-amber-500',
      features: ['Gestão Ilimitada de Processos', 'Suporte por Email', '5GB Armazenamento', 'WhatsApp Automático']
    },
    {
      id: 'pro',
      name: 'Câmara Profissional',
      price: 797,
      users: 15,
      icon: <Crown size={28} className="text-indigo-600" />,
      color: 'bg-indigo-600',
      recommended: true,
      features: ['Todos os benefícios Starter', 'Suporte Prioritário 8/5', '25GB Armazenamento', 'BI Financeiro Completo', 'Área do Advogado', 'Multicâmara']
    },
    {
      id: 'enterprise',
      name: 'Rede de Câmaras',
      price: 1897,
      users: 50,
      icon: <Shield size={28} className="text-rose-600" />,
      color: 'bg-rose-600',
      features: ['Todos os benefícios Pro', 'Gerente de Conta Exclusivo', 'Armazenamento Ilimitado', 'API Rest Completa', 'Auditoria Total', 'White Label']
    }
  ];

  const handleSelect = (plan: any) => {
    if (!isAuthenticated) {
      if (onBack) onBack(); // Manda de volta para Auth (Login/Cadastro)
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
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">inovaSys</span>
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
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sair
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
            Escolha seu Plano
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-[1.1]">
            Pronto para revolucionar seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Tribunal Arbitral?</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
            Escolha a ferramenta que vai escalar sua câmara com segurança jurídica e tecnologia de ponta.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.id} {...plan} onSelect={() => handleSelect(plan)} />
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200">
          <p className="text-sm text-slate-400 font-medium italic">
            "Transformamos a forma como câmaras de arbitragem operam no Brasil."
          </p>
        </div>
      </div>
    </div>
  );
}

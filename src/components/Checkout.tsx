import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft, 
  Lock, 
  Building2, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { applyMask } from '../utils/masks';
import { isValidDoc } from '../utils/validators';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { ecossistemaService } from '../services/ecossistemaService';

interface CheckoutProps {
  plan: {
    id: string;
    name: string;
    price: number;
    users: number;
    color: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function Checkout({ plan, onCancel, onSuccess }: CheckoutProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const { showToast } = useModal();

  // Form State
  const [nomeCamara, setNomeCamara] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const handleNext = () => {
    if (!nomeCamara || !cnpj) {
      showToast('Preencha os dados da instituição.', 'attention');
      return;
    }
    if (!isValidDoc(cnpj)) {
      showToast('CNPJ inválido.', 'attention');
      return;
    }
    setStep('payment');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = useAuthStore.getState().currentUser;
    
    if (!currentUser) {
      showToast('Sessão expirada. Faça login novamente.', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Processar Assinatura (MOCK Financeiro)
      // Aqui integraria com Stripe/Pagar.me
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Ativar Câmara e Perfil no DB Real
      await ecossistemaService.activateExistingUserAsGestor(
        currentUser.id,
        nomeCamara,
        cnpj.replace(/\D/g, ''),
        plan.id === 'starter' ? '00000000-0000-0000-0000-000000000001' : 
        plan.id === 'pro' ? '00000000-0000-0000-0000-000000000002' : 
        '00000000-0000-0000-0000-000000000003'
      );

      setLoading(false);
      setStep('success');
      
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      setLoading(false);
      showToast(error.message || 'Falha no processamento.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* ProgressBar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-100 z-50">
        <motion.div 
          className="h-full bg-indigo-600"
          initial={{ width: '0%' }}
          animate={{ width: step === 'info' ? '33%' : step === 'payment' ? '66%' : '100%' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Summary */}
        <div className="lg:col-span-5 space-y-10">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Voltar aos Planos
          </button>

          <div className="space-y-6">
            <h2 className="text-4xl font-black tracking-tight">Estamos quase lá.</h2>
            <p className="text-slate-500 font-medium">Você selecionou o plano <span className="text-indigo-600 font-bold">{plan.name}</span>. Garanta sua vaga no futuro da gestão arbitral.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Resumo do Pedido</span>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-white ${plan.color.replace('text-', 'bg-')}`}>
                {plan.name}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">Total Mensal</p>
                <p className="text-sm text-slate-500">Até {plan.users} usuários inclusos</p>
              </div>
              <p className="text-3xl font-black text-indigo-600">R$ {plan.price}</p>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <ShieldCheck size={18} />
                Acesso imediato após confirmação
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-2 ring-indigo-50/50" />
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Junte-se a mais de <span className="text-slate-900 font-bold">40 Câmaras</span> que já confiam no InovaSys para digitalizar seus ritos.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Dados da Instituição</h3>
                  <p className="text-slate-400 text-sm font-medium">Precisamos desses dados para configurar sua câmara exclusiva.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Câmara</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        placeholder="Ex: Câmara de Arbitragem Matriz"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                        value={nomeCamara}
                        onChange={e => setNomeCamara(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CNPJ da Instituição</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        placeholder="00.000.000/0000-00"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                        value={cnpj}
                        onChange={e => setCnpj(applyMask(e.target.value, 'doc'))}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                >
                  Próximo Passo: Pagamento
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.form 
                key="payment"
                onSubmit={handleProcessPayment}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Método de Pagamento</h3>
                  <div className="flex gap-2">
                    <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6 opacity-60" />
                    <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6 opacity-60" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome no Cartão</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium uppercase"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" required
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                        value={cardNumber}
                        onChange={e => setCardNumber(applyMask(e.target.value, 'card'))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Expiração</label>
                      <input 
                        type="text" required placeholder="MM/AA"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium uppercase"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(applyMask(e.target.value, 'expiry'))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                      <input 
                        type="text" required placeholder="000" maxLength={4}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium uppercase"
                        value={cardCVC}
                        onChange={e => setCardCVC(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <Lock className="text-slate-400 mt-1" size={16} />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Suas informações de pagamento são criptografadas e processadas de forma segura. Não armazenamos os dados sensíveis do seu cartão em nossos servidores.
                  </p>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : `Confirmar Assinatura (R$ ${plan.price})`}
                </button>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-4xl font-black tracking-tight">Pagamento Confirmado!</h3>
                <p className="text-slate-500 font-medium max-w-sm">
                  Parabéns! Sua câmara <span className="text-slate-900 font-bold">{nomeCamara}</span> foi ativada. Estamos preparando seu ambiente...
                </p>
                <div className="w-12 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

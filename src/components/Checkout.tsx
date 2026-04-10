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
import { Button } from '../presentation/ui/components/Button';

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
      await new Promise(resolve => setTimeout(resolve, 2500));

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
      }, 3500);
    } catch (error: any) {
      setLoading(false);
      showToast(error.message || 'Falha no processamento.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      {/* ProgressBar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
        <motion.div 
          className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: step === 'info' ? '33%' : step === 'payment' ? '66%' : '100%' }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Summary */}
        <div className="lg:col-span-5 space-y-10">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-widest border-b border-transparent group-hover:border-current">Voltar aos Planos</span>
          </button>

          <div className="space-y-6">
            <h2 className="text-5xl font-black tracking-tight leading-[0.9] text-slate-900">Finalizar <br/><span className="text-indigo-600">Investimento.</span></h2>
            <p className="text-slate-500 font-medium leading-relaxed">Você selecionou o plano <span className="text-slate-900 font-bold">{plan.name}</span>. Garanta sua autonomia jurídica hoje mesmo.</p>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
             
            <div className="flex justify-between items-center relative">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recibo de Proposta</span>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${plan.color.replace('text-', 'bg-')}`}>
                {plan.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">Custo Mensal</p>
                  <p className="text-sm text-slate-400 font-medium">Contrato recorrente trimestral</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-indigo-600">R$ {plan.price}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                Ativação Instantânea
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-bold text-xs uppercase tracking-widest">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-slate-400" />
                </div>
                {plan.users} Licenças Inclusas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-slate-100/50 rounded-3xl border border-slate-200/50">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/100?u=inovasys${i}`} 
                  className="w-12 h-12 rounded-full border-4 border-white shadow-sm" 
                  alt="User"
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Junte-se a <span className="text-slate-900 font-bold">centenas de árbitros</span> que já utilizam a rede <span className="text-indigo-600 font-black italic">InovaSys</span>.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/20">
          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">Instituição</h3>
                  <p className="text-slate-400 text-base font-medium">Configure a identidade jurídica da sua câmara.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia da Câmara</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Building2 className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={22} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Ex: Tribunal Arbitral de São Paulo"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                        value={nomeCamara}
                        onChange={e => setNomeCamara(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ Institucional</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={22} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="00.000.000/0000-00"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                        value={cnpj}
                        onChange={e => setCnpj(applyMask(e.target.value, 'doc'))}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleNext}
                  size="lg"
                  className="w-full py-6 rounded-3xl"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Seguir para Pagamento
                </Button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.form 
                key="payment"
                onSubmit={handleProcessPayment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div className="flex justify-between items-center">
                   <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight text-slate-900">Pagamento</h3>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Cartão de Crédito</p>
                  </div>
                  <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6" />
                    <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titular do Cartão</label>
                    <input 
                      type="text" required
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 uppercase"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <CreditCard className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={22} />
                      </div>
                      <input 
                        type="text" required
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                        value={cardNumber}
                        onChange={e => setCardNumber(applyMask(e.target.value, 'card'))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiração</label>
                      <input 
                        type="text" required placeholder="MM/AA"
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(applyMask(e.target.value, 'expiry'))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                      <input 
                        type="text" required placeholder="000" maxLength={4}
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center"
                        value={cardCVC}
                        onChange={e => setCardCVC(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center shrink-0">
                    <Lock className="text-slate-400" size={18} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                    Segurança de Nível Judicial. Suas informações são criptografadas (AES-256) e nunca armazenadas em texto plano.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  isLoading={loading}
                  size="lg"
                  className="w-full py-6 rounded-3xl"
                  icon={ShieldCheck}
                >
                  Concluir Assinatura de R$ {plan.price}
                </Button>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 lg:py-20 text-center space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-100 rounded-full"
                  />
                  <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 relative z-10">
                    <CheckCircle2 size={64} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">Consilium!</h3>
                  <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">
                    Sua jornada digital começou. A câmara <span className="text-indigo-600 font-black">{nomeCamara}</span> está online.
                  </p>
                </div>

                <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.5 }}
                  />
                </div>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Redirecionando para o Console...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

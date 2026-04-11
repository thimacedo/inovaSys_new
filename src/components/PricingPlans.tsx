import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStore } from '../presentation/state/authStore';
import { Check } from 'lucide-react';

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco_mensal: number;
  stripe_price_id: string;
  limites: Record<string, any>;
  destaque?: boolean;
}

export const PricingPlans: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const camaraId = (user as any)?.camara_id;

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        camaraId,
        userId: (user as any)?.id,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/planos?checkout=canceled`,
      }),
    });
    
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  useEffect(() => {
    const fetchPlanos = async () => {
      const { data } = await supabase.from('planos').select('*').order('preco_mensal');
      setPlanos(data || []);
      setLoading(false);
    };
    
    fetchPlanos();
  }, []);

  if (loading) return <div className="text-center py-12">Carregando planos...</div>;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Planos para sua Câmara
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Escolha o plano ideal para o seu volume de processos
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plano.destaque ? 'ring-2 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {plano.destaque && (
                <div className="bg-blue-600 text-white text-center py-1 text-sm font-medium">
                  Recomendado
                </div>
              )}
              
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900">{plano.nome}</h3>
                <p className="mt-2 text-gray-500">{plano.descricao}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    R$ {plano.preco_mensal}
                  </span>
                  <span className="text-gray-500">/mês</span>
                </p>
                <button
                  onClick={() => handleSubscribe(plano.stripe_price_id)}
                  className={`mt-8 w-full py-3 px-4 rounded-lg transition font-medium ${
                    plano.destaque 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Assinar Agora
                </button>
              </div>
              
              <div className="px-6 pb-8 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Inclui
                </h4>
                <ul className="space-y-3">
                  {plano.limites?.max_processos && (
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Até {plano.limites.max_processos} processos ativos</span>
                    </li>
                  )}
                  {plano.limites?.max_usuarios && (
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Até {plano.limites.max_usuarios} usuários</span>
                    </li>
                  )}
                  {plano.limites?.suporte_email && (
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Suporte por e-mail</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
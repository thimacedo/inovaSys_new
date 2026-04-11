import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { CreditCard, ExternalLink, AlertCircle } from 'lucide-react';

interface SubscriptionManagerProps {
  camaraId: string;
  userId: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ camaraId, userId }) => {
  const { loading, status, planoId, subscriptionId, manageSubscription } = useSubscription(camaraId);

  if (loading) return <div className="p-6 text-center">Carregando assinatura...</div>;

  const isActive = status === 'active';
  const isPastDue = status === 'past_due';

  const getStatusText = () => {
    if (status === 'active') return 'Ativa';
    if (status === 'past_due') return 'Pagamento Pendente';
    if (status === 'canceled') return 'Cancelada';
    if (status === 'trialing') return 'Período de Teste';
    return 'Sem assinatura';
  };

  const getStatusColor = () => {
    if (isActive || status === 'trialing') return 'text-green-600';
    if (isPastDue) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">Assinatura</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {subscriptionId && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">ID da Assinatura:</span>
            <span className="font-mono text-sm text-gray-800">{subscriptionId.slice(0, 12)}...</span>
          </div>
        )}

        {planoId && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Plano:</span>
            <span className="font-medium text-gray-800">#{planoId.slice(0, 8)}</span>
          </div>
        )}

        {isPastDue && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mt-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Sua assinatura está com pagamento pendente. Atualize seu método de pagamento para evitar interrupção.
            </p>
          </div>
        )}

        <div className="pt-4 mt-4">
          {isActive || isPastDue ? (
            <button
              onClick={manageSubscription}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Gerenciar Assinatura
            </button>
          ) : (
            <button
              onClick={() => {
                window.location.href = '/planos';
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Ver Planos Disponíveis
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
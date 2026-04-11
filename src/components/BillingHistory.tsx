import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, ExternalLink } from 'lucide-react';

interface Fatura {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  invoice_url: string;
  stripe_invoice_id: string;
}

export const BillingHistory: React.FC<{ camaraId: string }> = ({ camaraId }) => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaturas = async () => {
      if (!camaraId) return;
      
      const { data } = await supabase
        .from('faturas')
        .select('*')
        .eq('camara_id', camaraId)
        .order('paid_at', { ascending: false })
        .limit(20);
      
      setFaturas(data || []);
      setLoading(false);
    };

    fetchFaturas();
  }, [camaraId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) return <div className="p-6 text-center">Carregando histórico...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Histórico de Faturas</h3>
      </div>

      {faturas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma fatura encontrada para esta câmara.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((fatura) => (
                <tr key={fatura.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-800">{formatDate(fatura.paid_at)}</td>
                  <td className="py-3 px-2 font-medium text-gray-900">{formatCurrency(fatura.amount)}</td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pago
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <a
                      href={fatura.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Visualizar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
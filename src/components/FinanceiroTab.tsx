import React, { useState, useEffect } from 'react';
import { financeiroService, RegistroFinanceiro } from '../services/financeiroService';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { usePermissions } from '../hooks/usePermissions';
import { DollarSign, Plus, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function FinanceiroTab({ processoId, organizationId }: { processoId: string, organizationId: string }) {
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast, showConfirm, showPrompt } = useModal();
  const { isAtLeastAdmin } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);

  useEffect(() => {
    carregarRegistros();
  }, [processoId]);

  const carregarRegistros = async () => {
    setLoading(true);
    try {
      const data = await financeiroService.getByProcesso(processoId);
      setRegistros(data);
    } catch (error: any) {
      showToast('Erro ao carregar dados financeiros: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNovoRegistro = async () => {
    // Por simplicidade, usaremos prompts ou um modal interno no futuro.
    // Aqui vamos simular a criação de uma custa básica para teste de fluxo.
    showPrompt("Novo Lançamento", "Descrição do lançamento:", "Custas Iniciais", async (desc) => {
      if (!desc) return;
      showPrompt("Valor", "Valor (R$):", "0,00", async (valStr) => {
          if (!valStr) return;
          const valor = parseFloat(valStr.replace(',', '.'));
          try {
            await financeiroService.create({
              processo_id: processoId,
              organization_id: organizationId,
              descricao: desc,
              valor: valor,
              tipo: 'Custa',
              status: 'Pendente',
              data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            showToast('Lançamento criado!', 'success');
            carregarRegistros();
          } catch (e: any) {
            showToast('Erro ao criar: ' + e.message, 'error');
          }
      });
    });
  };

  const handleMarcarComoPago = async (id: string) => {
    try {
      await financeiroService.update(id, { 
        status: 'Pago', 
        data_pagamento: new Date().toISOString().split('T')[0] 
      });
      showToast('Pagamento registrado!', 'success');
      carregarRegistros();
    } catch (e: any) {
      showToast('Erro ao atualizar: ' + e.message, 'error');
    }
  };

  const handleExcluir = async (id: string) => {
    showConfirm("Excluir Lançamento", "Tem certeza que deseja remover este registro financeiro?", async () => {
      try {
        await financeiroService.delete(id);
        showToast('Removido com sucesso!', 'success');
        carregarRegistros();
      } catch (e: any) {
        showToast('Erro ao remover: ' + e.message, 'error');
      }
    });
  };

  const totalPendente = registros.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + Number(r.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-bold text-slate-800">Controle Financeiro</h4>
          <p className="text-sm text-slate-500">Gestão de custas e honorários deste processo</p>
        </div>
        {isAtLeastAdmin && (
          <button 
            onClick={handleNovoRegistro}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus size={18} />
            Novo Lançamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Pendente</p>
          <p className="text-2xl font-black text-red-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Pago</p>
          <p className="text-2xl font-black text-green-600">R$ {registros.filter(r => r.status === 'Pago').reduce((acc, r) => acc + Number(r.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Nº de Lançamentos</p>
          <p className="text-2xl font-black text-slate-800">{registros.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Descrição</th>
              <th className="px-6 py-4 font-bold text-slate-600">Tipo</th>
              <th className="px-6 py-4 font-bold text-slate-600">Valor</th>
              <th className="px-6 py-4 font-bold text-slate-600">Vencimento</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Carregando dados financeiros...</td></tr>
            ) : registros.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum lançamento financeiro para este processo.</td></tr>
            ) : (
              registros.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{reg.descricao}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                      {reg.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="px-6 py-4">
                    {reg.status === 'Pago' ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-bold">
                        <CheckCircle size={14} />
                        Pago
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                        <Clock size={14} />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'Pendente' && isAtLeastAdmin && (
                        <button 
                          onClick={() => handleMarcarComoPago(reg.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marcar como pago"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {isAtLeastAdmin && (
                        <button 
                          onClick={() => handleExcluir(reg.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

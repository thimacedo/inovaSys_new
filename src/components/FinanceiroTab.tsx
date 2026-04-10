import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { financeiroService } from '../services/financeiroService';
import { FinanceiroEntity as RegistroFinanceiro } from '../infrastructure/database/repositories/FinanceiroRepository';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Trash2, 
  X, 
  Save,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export default function FinanceiroTab({ processoId, organizationId }: { processoId: string, organizationId: string }) {
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'Custa' as any,
    data_vencimento: new Date().toISOString().split('T')[0]
  });
  
  const { showToast, showConfirm } = useModal();
  const { isAtLeastAdmin } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);

  useEffect(() => {
    carregarRegistros();
  }, [processoId]);

  const carregarRegistros = async () => {
    setLoading(true);
    try {
      const data = await financeiroService.listByProcesso(processoId);
      setRegistros(data);
    } catch (error: any) {
      showToast('Erro ao carregar dados financeiros: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor) return;

    const valor = parseFloat(formData.valor.replace(',', '.'));
    if (isNaN(valor)) {
      showToast('Valor numérico inválido', 'attention');
      return;
    }

    try {
      await financeiroService.create({
        processo_id: processoId,
        organization_id: organizationId,
        descricao: formData.descricao,
        valor: valor,
        tipo: formData.tipo,
        status: 'Pendente',
        data_vencimento: formData.data_vencimento
      });
      showToast('Lançamento registrado!', 'success');
      setShowForm(false);
      setFormData({ 
        descricao: '', 
        valor: '', 
        tipo: 'Custa', 
        data_vencimento: new Date().toISOString().split('T')[0] 
      });
      carregarRegistros();
    } catch (e: any) {
      showToast('Erro ao criar: ' + e.message, 'error');
    }
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
  const totalPago = registros.filter(r => r.status === 'Pago').reduce((acc, r) => acc + Number(r.valor), 0);

  return (
    <div className="space-y-6">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custas Pendentes</p>
            <p className="text-xl font-black text-amber-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <TrendingDown size={20} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Honorários Recebidos</p>
            <p className="text-xl font-black text-emerald-600">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-2 rounded-3xl border border-slate-200 flex items-center justify-center">
            {isAtLeastAdmin && !showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full h-full flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-dashed border-slate-200"
                >
                  <Plus size={18} />
                  Novo Lançamento
                </button>
            )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-bold flex items-center gap-2">
                <Plus size={16} className="text-emerald-400" />
                Registrar Lançamento Financeiro
              </h5>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">Descrição</label>
                <input 
                  type="text" 
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Ex: Honorários Arbitrais - Parcela 1"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">Valor (R$)</label>
                <input 
                  type="text" 
                  value={formData.valor}
                  onChange={e => setFormData({...formData, valor: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Save size={16} />
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Processando...</td></tr>
              ) : registros.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum lançamento registrado.</td></tr>
              ) : (
                registros.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{reg.descricao}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{reg.tipo}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {reg.status === 'Pago' ? (
                          <div className="flex items-center gap-1 py-1 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                            <CheckCircle size={12} />
                            Pago
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 py-1 px-3 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">
                            <Clock size={12} />
                            Pendente
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {reg.status === 'Pendente' && isAtLeastAdmin && (
                          <button 
                            onClick={() => handleMarcarComoPago(reg.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                            title="Confirmar Pagamento"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {isAtLeastAdmin && (
                          <button 
                            onClick={() => handleExcluir(reg.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-100"
                            title="Remover"
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
    </div>
  );
}

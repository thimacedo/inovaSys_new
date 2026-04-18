import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { financeiroService } from '../services/financeiroService';
import { useModal } from '../context/ModalContext';
import { usePermissions } from '../hooks/usePermissions';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { FinanceiroStats } from './financeiro/FinanceiroStats';
import { FinanceiroForm } from './financeiro/FinanceiroForm';
import { FinanceiroTable } from './financeiro/FinanceiroTable';

export default function FinanceiroTab({ processoId, organizationId }: { processoId: string, organizationId: string }) {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const { showToast, showConfirm } = useModal();
  const { isAtLeastAdmin } = usePermissions();

  const carregarRegistros = async () => {
    setLoading(true);
    try {
      const data = await financeiroService.listByProcesso(processoId);
      setRegistros(data);
    } catch (e: any) {
      showToast('Falha na sincronização financeira.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarRegistros(); }, [processoId]);

  // Handlers de Lógica (Padrão Silent Logic)
  const handleSubmit = async (data: any) => {
    const valorNum = parseFloat(data.valor.replace(',', '.'));
    if (isNaN(valorNum)) return showToast('Valor inválido.', 'attention');

    try {
      await financeiroService.create({
        processo_id: processoId,
        organization_id: organizationId,
        descricao: data.descricao,
        valor: valorNum,
        tipo: 'Custa',
        status: 'Pendente',
        data_vencimento: new Date().toISOString().split('T')[0]
      });
      showToast('Lançamento efetuado.', 'success');
      setShowForm(false);
      carregarRegistros();
    } catch (e: any) { showToast('Erro no registro.', 'error'); }
  };

  const handlePay = async (id: string) => {
    try {
      await financeiroService.update(id, { status: 'Pago', data_pagamento: new Date().toISOString().split('T')[0] });
      showToast('Pagamento liquidado.', 'success');
      carregarRegistros();
    } catch (e: any) { showToast('Erro na atualização.', 'error'); }
  };

  const handleDelete = (id: string) => {
    showConfirm("Remover Registro", "Esta ação não pode ser desfeita.", async () => {
      try {
        await financeiroService.delete(id);
        showToast('Removido.', 'success');
        carregarRegistros();
      } catch (e: any) { showToast('Erro na remoção.', 'error'); }
    });
  };

  const totalPendente = registros.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + Number(r.valor), 0);
  const totalPago = registros.filter(r => r.status === 'Pago').reduce((acc, r) => acc + Number(r.valor), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* 📊 Resumo Financeiro MD3 */}
      <FinanceiroStats 
        totalPendente={totalPendente} 
        totalPago={totalPago} 
        isAtLeastAdmin={isAtLeastAdmin} 
        onNewClick={() => setShowForm(true)} 
      />

      <AnimatePresence>
        {showForm && (
          <FinanceiroForm 
            onSubmit={handleSubmit} 
            onClose={() => setShowForm(false)} 
          />
        )}
      </AnimatePresence>

      {/* 🧾 Extrato de Lançamentos */}
      <FinanceiroTable 
        registros={registros} 
        loading={loading} 
        isAtLeastAdmin={isAtLeastAdmin} 
        onPay={handlePay} 
        onDelete={handleDelete} 
      />

    </div>
  );
}

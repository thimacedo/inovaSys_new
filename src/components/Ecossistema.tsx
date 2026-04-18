import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useModal } from '../context/ModalContext';
import { ecossistemaService, Camara, Plano } from '../services/ecossistemaService';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { EcossistemaHeader } from './ecossistema/EcossistemaHeader';
import { PlatformMetrics } from './ecossistema/PlatformMetrics';
import { InstitutionTable } from './ecossistema/InstitutionTable';

export default function Ecossistema() {
  const { showToast, showModal, showPrompt, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<'geral' | 'contas'>('geral');
  const [contas, setContas] = useState<Camara[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [contasData, metricsData, planosData] = await Promise.all([
        ecossistemaService.getContas(),
        ecossistemaService.getMetrics(),
        ecossistemaService.getPlanos()
      ]);
      setContas(contasData);
      setMetrics(metricsData);
      setPlanos(planosData);
    } catch (e) { showToast("Falha na sincronização global.", 'error'); }
  };

  useEffect(() => { loadData(); }, []);

  // Handlers de Lógica
  const handleToggleStatus = async (conta: Camara) => {
    const acao = !conta.ativa ? 'reativar' : 'suspender';
    showConfirm(`${acao.toUpperCase()} Licença`, `Confirmar ação para ${conta.nome}?`, async () => {
      await ecossistemaService.toggleCamaraStatus(conta.id, !conta.ativa);
      showToast(`Conta ${acao}da.`, 'success');
      loadData();
    });
  };

  const handleAddBonus = (camara: Camara) => {
    showPrompt("Bônus de Licença", "Dias extras de acesso:", "0", async (d) => {
      await ecossistemaService.addBonus(camara.id, Number(d));
      showToast("Bônus aplicado.", 'success');
      loadData();
    }, 'number');
  };

  const handleAccess = (conta: Camara) => {
    showToast(`Iniciando impersonation: ${conta.nome}`, 'attention');
    localStorage.setItem('impersonated_camara_id', conta.id);
    window.location.reload();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      <EcossistemaHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'geral' ? (
          <motion.div key="geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <PlatformMetrics metrics={metrics} />
            {/* Seção de Gráficos omitida para brevidade, pode ser modularizada depois */}
          </motion.div>
        ) : (
          <InstitutionTable 
            contas={contas.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()))}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onNew={() => showToast("Módulo de nova afiliação em refatoração.", "attention")}
            onToggle={handleToggleStatus}
            onBonus={handleAddBonus}
            onAccess={handleAccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

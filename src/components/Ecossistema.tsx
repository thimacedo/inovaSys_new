import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Building2, 
  CreditCard, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { ecossistemaService, Camara, Plano } from '../services/ecossistemaService';
import { emailService } from '../services/emailService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function NovaAfiliacaoForm({ onAdded, planos }: { onAdded: () => void, planos: Plano[] }) {
  const [nome, setNome] = useState('');
  const [planoId, setPlanoId] = useState('');
  const [emailGestor, setEmailGestor] = useState('');
  const [diasBonus, setDiasBonus] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast, showModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await ecossistemaService.createCamara(nome, planoId, emailGestor, diasBonus);
      
      // Enviar E-mail de Boas-vindas (Background)
      try {
        const t = emailService.templates.boasVindasGestor(emailGestor, result.tempPassword, nome);
        const html = emailService.generateBaseTemplate({
          camaraNome: 'InovaSys Ecossistema',
          destinatario: nome,
          assunto: t.assunto,
          corpo: t.corpo,
          linkAction: t.link
        });
        await emailService.send(emailGestor, t.assunto, html);
      } catch (e) {
        console.error('Falha silenciosa no envio de e-mail:', e);
      }
      
      // Fechar o modal atual primeiro
      const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
      if (closeBtn instanceof HTMLElement) closeBtn.click();

      // Mostrar modal de sucesso com a senha
      showModal(
        "Afiliação Criada com Sucesso!",
        <div className="space-y-4 p-2 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-sm text-slate-600">
            A câmara <strong>{nome}</strong> foi registrada. O gestor já pode acessar o sistema.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dados de Acesso</p>
            <p className="text-sm font-bold text-slate-700">E-mail: <span className="font-mono text-red-600">{emailGestor}</span></p>
            <p className="text-sm font-bold text-slate-700 mt-1">Senha Temp: <span className="font-mono text-red-600">{result.tempPassword}</span></p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            * Recomende ao gestor alterar a senha no primeiro acesso.
          </p>
          <button 
            onClick={() => {
              const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
              if (closeBtn instanceof HTMLElement) closeBtn.click();
            }}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Entendido
          </button>
        </div>
      );
      onAdded();
    } catch (err: any) {
      showToast('Erro ao criar afiliação: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Instituição</label>
        <input 
          type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
          placeholder="Ex: Câmara de Arbitragem de SP"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plano</label>
          <select 
            required value={planoId} onChange={(e) => setPlanoId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">Selecione...</option>
            {planos.map(p => (
              <option key={p.id} value={p.id}>{p.nome} ({p.limite_usuarios} users)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bônus (Dias)</label>
          <input 
            type="number" value={diasBonus} onChange={(e) => setDiasBonus(Number(e.target.value))}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail do Gestor Principal</label>
        <input 
          type="email" required value={emailGestor} onChange={(e) => setEmailGestor(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
          placeholder="gestor@email.com"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={() => {
            const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
            if (closeBtn instanceof HTMLElement) closeBtn.click();
          }}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Afiliação'}
        </button>
      </div>
    </form>
  );
}

function NovoParceiroForm({ onAdded }: { onAdded: () => void }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Escritório de Advocacia');
  const [loading, setLoading] = useState(false);
  const { showToast } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ecossistemaService.createParceiro(nome, categoria);
      showToast('Sucesso: Parceiro adicionado com sucesso!', 'success');
      onAdded();
    } catch (err: any) {
      showToast('Erro ao adicionar parceiro: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Parceiro</label>
        <input 
          type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
          placeholder="Ex: Escritório Silva & Associados"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
        <select 
          required value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20"
        >
          <option value="Escritório de Advocacia">Escritório de Advocacia</option>
          <option value="Seguradora">Seguradora</option>
          <option value="Banco">Banco</option>
          <option value="Instituição Pública">Instituição Pública</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={() => {
            const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
            if (closeBtn instanceof HTMLElement) closeBtn.click();
          }}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar Parceiro'}
        </button>
      </div>
    </form>
  );
}

export default function Ecossistema() {
  const { showToast, showModal, showPrompt, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<'geral' | 'contas'>('geral');
  const [contas, setContas] = useState<Camara[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    const [contasData, metricsData, planosData, activitiesData] = await Promise.all([
      ecossistemaService.getContas(),
      ecossistemaService.getMetrics(),
      ecossistemaService.getPlanos(),
      ecossistemaService.getRecentActivity()
    ]);
    setContas(contasData);
    setMetrics(metricsData);
    setPlanos(planosData);
    setActivities(activitiesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNovaAfiliacao = () => {
    showModal(
      "Nova Afiliação Corporativa",
      <NovaAfiliacaoForm planos={planos} onAdded={() => {
        loadData();
        const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
        if (closeBtn instanceof HTMLElement) closeBtn.click();
      }} />
    );
  };

  const handleAddBonus = (camara: Camara) => {
    showPrompt(
      "Adicionar Bônus",
      `Quantos dias de bônus deseja adicionar para ${camara.nome}?`,
      "0",
      async (dias) => {
        if (!dias || isNaN(Number(dias))) return;
        try {
          await ecossistemaService.addBonus(camara.id, Number(dias));
          showToast(`Sucesso: ${dias} dias de bônus adicionados!`, 'success');
          loadData();
        } catch (e) {
          showToast("Erro ao adicionar bônus.", 'error');
        }
      },
      'number'
    );
  };

  const handleToggleStatus = async (conta: Camara) => {
    const novoStatus = !conta.ativa;
    const acao = novoStatus ? 'reativar' : 'desativar';
    
    showConfirm(
      `${novoStatus ? 'Reativar' : 'Desativar'} Conta`,
      `Tem certeza que deseja ${acao} a conta da ${conta.nome}?`,
      async () => {
        try {
          await ecossistemaService.toggleCamaraStatus(conta.id, novoStatus);
          showToast(`Sucesso: Conta ${acao}da com sucesso!`, 'success');
          loadData();
        } catch (e) {
          showToast(`Erro ao ${acao} conta.`, 'error');
        }
      },
      novoStatus ? "Reativar" : "Desativar"
    );
  };

  const handleAcessarConta = (conta: Camara) => {
    showToast(`Simulando acesso ao painel de ${conta.nome}...`, 'attention');
    // Em um sistema real, aqui você alteraria o contexto do usuário ou redirecionaria
    // com um token de impersonation.
    setTimeout(() => {
      window.location.href = `/?camara_id=${conta.id}&impersonate=true`;
    }, 1500);
  };

  const handleNovoParceiro = () => {
    showModal(
      "Novo Parceiro Estratégico",
      <NovoParceiroForm onAdded={() => {
        loadData();
        const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
        if (closeBtn instanceof HTMLElement) closeBtn.click();
      }} />
    );
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Crescimento de Contas',
        data: [4, 6, 9, 12, 15, 18],
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const filteredContas = contas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Globe className="text-red-600" size={32} />
            REDE DE CÂMARAS
          </h2>
          <p className="text-slate-500 font-medium">Gerencie as câmaras parceiras e o ecossistema InovaSys.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm self-start">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'geral' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('contas')}
            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'contas' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Câmaras
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'geral' && (
          <motion.div 
            key="geral"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Câmaras Ativas', value: metrics?.contasAtivas || 0, icon: Building2, color: 'red', trend: '+12%' },
                { label: 'MRR Total', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalMrr || 0), icon: CreditCard, color: 'blue', trend: '+8%' },
                { label: 'Usuários Totais', value: '128', icon: Users, color: 'purple', trend: '+24%' },
                { label: 'Churn Rate', value: '1.2%', icon: TrendingUp, color: 'orange', trend: '-2%', negative: true }
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 bg-${m.color}-50 text-${m.color}-600 rounded-xl group-hover:bg-${m.color}-600 group-hover:text-white transition-colors`}>
                      <m.icon size={20} />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold ${m.negative ? 'text-red-600' : 'text-green-600'}`}>
                      {m.negative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      {m.trend}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                    <h4 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{m.value}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={18} className="text-red-600" />
                    Crescimento do Ecossistema
                  </h4>
                  <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-500/20">
                    <option>Últimos 6 meses</option>
                    <option>Último ano</option>
                  </select>
                </div>
                <div className="h-[300px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-red-600" />
                  Atividade Recente
                </h4>
                <div className="space-y-6">
                  {activities.map((act) => (
                    <div key={act.id} className="flex gap-4 items-start group">
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{act.tipo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{act.descricao}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                          {new Date(act.data).toLocaleDateString('pt-BR')} às {new Date(act.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 text-[10px] font-bold text-slate-400 hover:text-red-600 border border-dashed border-slate-200 rounded-xl hover:border-red-600 transition-all uppercase tracking-widest">
                  Ver todo o histórico
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'contas' && (
          <motion.div 
            key="contas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por nome da câmara..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200">
                  <Filter size={18} />
                </button>
                <button 
                  onClick={handleNovaAfiliacao}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nova Afiliação
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instituição</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiração</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bônus</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRR</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContas.map(conta => (
                    <tr key={conta.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">#{conta.id.substring(0, 4)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            conta.ativa ? 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 shadow-inner' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <Building2 size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${conta.ativa ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{conta.nome}</span>
                            {!conta.ativa && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Desativada</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                          conta.plano_nome === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          conta.plano_nome === 'Pro' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {conta.plano_nome}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-600">
                            {new Date(conta.data_expiracao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-slate-400">Renovação Mensal</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">+{conta.dias_bonus} dias</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.mrr || 0)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleToggleStatus(conta)}
                            className={`p-2 rounded-xl transition-all ${
                              conta.ativa ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={conta.ativa ? "Desativar Conta" : "Reativar Conta"}
                          >
                            {conta.ativa ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                          </button>
                          <button 
                            onClick={() => handleAddBonus(conta)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Adicionar Bônus"
                          >
                            <Plus size={18} />
                          </button>
                          <button 
                            onClick={() => handleAcessarConta(conta)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Acessar Painel da Câmara"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

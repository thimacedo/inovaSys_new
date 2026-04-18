import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useModal } from '../context/ModalContext';
import { isValidDoc } from '../utils/validators';
import { supabase } from '../lib/supabase';
import { useCamaraSettings, useUpdateCamaraSettings } from '../presentation/hooks/useSettings';
import { iuguService } from '../services/IuguService';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { ConfigHeader } from './settings/ConfigHeader';
import { InstitutionInfoForm } from './settings/InstitutionInfoForm';
import { BrandingForm } from './settings/BrandingForm';
import { IntegrationsForm } from './settings/IntegrationsForm';
import { FinancialSettingsForm } from './settings/FinancialSettingsForm';

import { Save, Building2, Palette, Globe, Landmark } from 'lucide-react';

interface ConfigFormData {
  nome: string; cnpj: string; logradouro: string; bairro: string; cidade: string; 
  estado: string; cep: string; fone: string; presidente_nome: string;
  webhook_url: string; webhook_token: string; logo: string;
  iugu_account_id: string; banco: string; agencia: string; conta: string; conta_tipo: string; recebedor_doc: string;
}

export default function CamaraConfig({ camaraId }: { camaraId?: string }) {
  const { data: camaraData, isLoading } = useCamaraSettings(camaraId);
  const updateSettingsMutation = useUpdateCamaraSettings();
  const { showToast } = useModal();

  const [activeTab, setActiveTab] = useState<'geral' | 'identidade' | 'integracao' | 'financeiro'>('geral');
  const [formData, setFormData] = useState<ConfigFormData>({
    nome: '', cnpj: '', logradouro: '', bairro: '', cidade: '', estado: '', cep: '', fone: '', presidente_nome: '',
    webhook_url: '', webhook_token: '', logo: '',
    iugu_account_id: '', banco: '', agencia: '', conta: '', conta_tipo: 'Corrente', recebedor_doc: ''
  });
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    if (camaraData) {
      const typedData = camaraData as any;
      setFormData({
        nome: typedData.nome || '',
        cnpj: typedData.cnpj || '',
        logradouro: typedData.logradouro || '',
        bairro: typedData.bairro || '',
        cidade: typedData.cidade || '',
        estado: typedData.estado || '',
        cep: typedData.cep || '',
        fone: typedData.fone || '',
        presidente_nome: typedData.presidente_nome || '',
        webhook_url: typedData.webhook_url || '',
        webhook_token: typedData.webhook_token || '',
        logo: typedData.logo || '',
        iugu_account_id: typedData.iugu_account_id || '',
        banco: typedData.banco || '',
        agencia: typedData.agencia || '',
        conta: typedData.conta || '',
        conta_tipo: typedData.conta_tipo || 'Corrente',
        recebedor_doc: typedData.recebedor_doc || ''
      });
    }
  }, [camaraData]);

  if (!camaraId) return null;

  const handleFieldChange = (field: string, val: string) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Processando identidade...', 'attention');
      const fileName = `logo_${camaraId}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('anexos').upload(`logos/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('anexos').getPublicUrl(`logos/${fileName}`);
      handleFieldChange('logo', publicUrl);
      showToast('Identidade atualizada.', 'success');
    } catch (err) { showToast('Falha no upload.', 'error'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cnpj && !isValidDoc(formData.cnpj)) return showToast('CNPJ inválido.', 'attention');
    
    try {
      let currentIuguId = formData.iugu_account_id;

      // 🚀 Integração Financeira: Se não houver subconta Iugu, cria agora
      if (!currentIuguId && formData.banco && formData.conta) {
        showToast('Configurando Marketplace Iugu...', 'attention');
        const res = await iuguService.criarSubconta(camaraId, formData.nome);
        currentIuguId = res.iugu_id;
        handleFieldChange('iugu_account_id', currentIuguId);
      }

      await updateSettingsMutation.mutateAsync({ 
        id: camaraId, 
        data: { ...formData, iugu_account_id: currentIuguId } 
      });
      
      showToast("Configurações salvas.", 'success');
      localStorage.removeItem('camara_config');
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) { showToast("Erro ao sincronizar.", 'error'); }
  };

  const handleTestWebhook = async () => {
    if (!formData.webhook_url) return showToast('Informe a URL.', 'attention');
    setTestingWebhook(true);
    try {
      const res = await fetch(formData.webhook_url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${formData.webhook_token}` }, body: JSON.stringify({ event: 'test' }) });
      showToast(res.ok ? 'Webhook conectado!' : 'Erro na conexão.', res.ok ? 'success' : 'error');
    } catch (e) { showToast('Falha técnica.', 'error'); } finally { setTestingWebhook(false); }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center py-40 gap-4"><div className="w-12 h-12 border-4 border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div></div>;

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Building2 },
    { id: 'identidade', label: 'Identidade', icon: Palette },
    { id: 'integracao', label: 'Integrações', icon: Globe },
    { id: 'financeiro', label: 'Financeiro', icon: Landmark },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-6xl mx-auto pb-20">
      <ConfigHeader />

      {/* 🧊 Tab Switcher MD3 */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 w-fit mx-auto shadow-inner">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-md scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="min-h-[400px]">
          {activeTab === 'geral' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <InstitutionInfoForm data={formData} onChange={handleFieldChange} />
            </motion.div>
          )}

          {activeTab === 'identidade' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <BrandingForm logo={formData.logo} onLogoChange={handleLogoChange} />
            </motion.div>
          )}

          {activeTab === 'integracao' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <IntegrationsForm 
                webhookUrl={formData.webhook_url} 
                webhookToken={formData.webhook_token} 
                onChange={handleFieldChange} 
                onTest={handleTestWebhook} 
                testing={testingWebhook} 
              />
            </motion.div>
          )}

          {activeTab === 'financeiro' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <FinancialSettingsForm 
                data={formData} 
                onChange={handleFieldChange} 
                iuguAccountId={formData.iugu_account_id} 
              />
            </motion.div>
          )}
        </div>

        <div className="flex justify-end pt-8">
          <button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="rounded-full px-16 py-5 font-bold text-xs uppercase tracking-widest transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary hover:shadow-2xl hover:brightness-110 shadow-md-primary/20 shadow-lg"
          >
            {updateSettingsMutation.isPending ? 'Sincronizando...' : 'Salvar Alterações'}
            <Save size={20} className="ml-2" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}


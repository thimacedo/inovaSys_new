import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building2, 
  Image as ImageIcon, 
  User, 
  Phone, 
  MapPin, 
  Zap,
  UploadCloud,
  Fingerprint
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { isValidDoc } from '../utils/validators';
import { supabase } from '../lib/supabase';
import { applyMask } from '../utils/masks';
import { useCamaraSettings, useUpdateCamaraSettings } from '../presentation/hooks/useSettings';

export default function CamaraConfig({ camaraId }: { camaraId?: string }) {
  const { data: camaraData, isLoading } = useCamaraSettings(camaraId);
  const updateSettingsMutation = useUpdateCamaraSettings();
  const { showToast } = useModal();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [fone, setFone] = useState('');
  const [presidenteNome, setPresidenteNome] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [logo, setLogo] = useState('');
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    if (camaraData) {
      setNome(camaraData.nome || '');
      setCnpj(camaraData.cnpj || '');
      setLogradouro(camaraData.logradouro || '');
      setBairro(camaraData.bairro || '');
      setCidade(camaraData.cidade || '');
      setEstado(camaraData.estado || '');
      setCep(camaraData.cep || '');
      setFone(camaraData.fone || '');
      setPresidenteNome(camaraData.presidente_nome || '');
      setWebhookUrl(camaraData.webhook_url || '');
      setWebhookToken(camaraData.webhook_token || '');
      setLogo(camaraData.logo || '');
    }
  }, [camaraData]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processando logo...', 'attention');
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${camaraId}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('anexos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('anexos').getPublicUrl(filePath);
      setLogo(publicUrl);
      showToast('Logo atualizada com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao processar logo.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cnpj && !isValidDoc(cnpj)) {
      showToast('CNPJ inválido.', 'attention');
      return;
    }

    if (!camaraId) return;

    try {
      const configData = {
        nome,
        cnpj: cnpj.replace(/\D/g, ''),
        logradouro,
        bairro,
        cidade,
        estado,
        cep,
        endereco: `${logradouro}, ${bairro}, ${cidade}/${estado} - CEP: ${cep}`,
        fone,
        presidente_nome: presidenteNome,
        logo,
        webhook_url: webhookUrl,
        webhook_token: webhookToken
      };

      await updateSettingsMutation.mutateAsync({ id: camaraId, data: configData });
      showToast("Configurações salvas com sucesso!", 'success');
      
      // Força a atualização do localStorage e avisa o Dashboard
      localStorage.removeItem('camara_config');
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('[CamaraConfig] Erro ao salvar:', error);
      if (error.message?.includes('column')) {
        showToast("Erro: Colunas faltando no banco. Execute o script de reparo.", 'error');
      } else {
        showToast("Erro ao salvar configurações. " + (error.message || ''), 'error');
      }
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return showToast('Informe a URL do Webhook.', 'attention');
    setTestingWebhook(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': webhookToken ? `Bearer ${webhookToken}` : ''
        },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() })
      });
      if (response.ok) showToast('Webhook conectado!', 'success');
      else showToast('Erro na conexão do Webhook.', 'error');
    } catch (error) {
      showToast('Falha ao conectar com o Webhook.', 'error');
    } finally {
      setTestingWebhook(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="text-blue-600" size={32} />
            CONFIGURAÇÕES DA CÂMARA
          </h2>
          <p className="text-slate-500 font-medium">Personalize os dados e a identidade visual da sua instituição.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <h4>Informações da Instituição</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={cnpj} 
                    onChange={e => setCnpj(applyMask(e.target.value, 'doc'))} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Presidente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={presidenteNome} 
                    onChange={e => setPresidenteNome(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone / Contato</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={fone} 
                    onChange={e => setFone(applyMask(e.target.value, 'phone'))} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logradouro (Rua, Nº, Complemento)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={logradouro} 
                    onChange={e => setLogradouro(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:col-span-2">
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" required />
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" required />
                <input type="text" maxLength={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all uppercase" value={estado} onChange={e => setEstado(e.target.value)} placeholder="UF" required />
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={cep} onChange={e => setCep(applyMask(e.target.value, 'cep'))} placeholder="CEP" required />
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8 bg-slate-50/30">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ImageIcon size={24} />
              </div>
              <h4>Identidade Visual</h4>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-500">Faça o upload da logomarca (PNG ou SVG transparente recomendado).</p>
                <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoChange} />
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                  <UploadCloud className="text-slate-400 group-hover:text-blue-600 mb-2" size={32} />
                  <span className="text-xs font-bold text-slate-700">Escolher Arquivo</span>
                </label>
              </div>
              
              <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-4 shadow-sm relative overflow-hidden">
                {logo ? <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" /> : <ImageIcon size={40} className="text-slate-100" />}
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Zap size={24} />
              </div>
              <h4>Integrações Webhook</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-2">
                <input type="url" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="URL do Webhook" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                <button type="button" disabled={testingWebhook} onClick={handleTestWebhook} className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50">
                  {testingWebhook ? 'Testando...' : 'Testar'}
                </button>
              </div>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="Bearer Token" value={webhookToken} onChange={e => setWebhookToken(e.target.value)} />
            </div>
          </div>

          <div className="p-8 md:p-10 bg-slate-50 flex justify-end gap-4">
            <button 
              type="submit" 
              disabled={updateSettingsMutation.isPending}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
            >
              {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

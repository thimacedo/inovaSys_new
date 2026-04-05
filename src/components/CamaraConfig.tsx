import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building2, 
  Link, 
  Save, 
  Image as ImageIcon, 
  User, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Fingerprint
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { auditService } from '../services/auditService';
import { isValidDoc } from '../utils/validators';
import { supabase } from '../lib/supabase';

export default function CamaraConfig({ camaraId }: { camaraId?: string }) {
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
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const { showToast } = useModal();

  useEffect(() => {
    const loadInitial = async () => {
      // Try to load from database if camaraId is available
      if (camaraId) {
        const { data } = await supabase.from('camaras').select('*').eq('id', camaraId).maybeSingle();
        if (data) {
          setNome(data.nome || '');
          setCnpj(data.cnpj || '');
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.cidade || '');
          setEstado(data.estado || '');
          setCep(data.cep || '');
          setFone(data.fone || '');
          setPresidenteNome(data.presidente_nome || '');
          setWebhookUrl(data.webhook_url || '');
          setWebhookToken(data.webhook_token || '');
          setLogo(data.logo || '');
          
          // Also sync to localStorage
          localStorage.setItem('camara_config', JSON.stringify(data));
          return;
        }
      }

      // Fallback to localStorage
      const conf = JSON.parse(localStorage.getItem('camara_config') || '{}');
      setNome(conf.nome || '');
      setCnpj(conf.cnpj || '');
      setLogradouro(conf.logradouro || '');
      setBairro(conf.bairro || '');
      setCidade(conf.cidade || '');
      setEstado(conf.estado || '');
      setCep(conf.cep || '');
      setFone(conf.fone || '');
      setPresidenteNome(conf.presidente_nome || '');
      setWebhookUrl(conf.webhook_url || '');
      setWebhookToken(conf.webhook_token || '');
      setLogo(conf.logo || '');
    };

    loadInitial();
  }, [camaraId]);

  const applyMask = (value: string, maskType: 'doc' | 'phone') => {
    let v = value.replace(/\D/g, "");
    if (maskType === 'doc') {
      if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    } else if (maskType === 'phone') {
      if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
      return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        const MAX_WIDTH = 500; const MAX_HEIGHT = 200;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = width * ratio; height = height * ratio;
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setLogo(canvas.toDataURL(file.type));
        }
      };
      if (ev.target?.result) {
        img.src = ev.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cnpj && !isValidDoc(cnpj)) {
      showToast('CNPJ inválido.', 'attention');
      return;
    }

    setSaving(true);
    try {
      const configData = {
        nome,
        cnpj,
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

      // Save to localStorage
      localStorage.setItem('camara_config', JSON.stringify(configData));
      
      // Save to database if camaraId is available
      if (camaraId) {
        const { error: dbError } = await supabase
          .from('camaras')
          .update(configData)
          .eq('id', camaraId);
        
        if (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
          // Don't throw, just log. LocalStorage is still updated.
        }
      }
      
      await auditService.log('ATUALIZAR_CONFIGURACOES', {
        nome,
        cnpj,
        presidente_nome: presidenteNome,
        webhook_url: webhookUrl ? '***' : ''
      });
      
      showToast("Configurações salvas com sucesso!", 'success');
      // Trigger storage event for Dashboard to update
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      showToast("Erro ao salvar configurações.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      showToast('Informe a URL do Webhook para testar.', 'attention');
      return;
    }

    setTestingWebhook(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': webhookToken ? `Bearer ${webhookToken}` : ''
        },
        body: JSON.stringify({
          event: 'test_connection',
          timestamp: new Date().toISOString(),
          message: 'Teste de conexão InovaSys'
        })
      });

      if (response.ok) {
        showToast('Webhook testado com sucesso!', 'success');
      } else {
        showToast(`Erro no Webhook: Status ${response.status}`, 'error');
      }
    } catch (error) {
      showToast('Falha ao conectar com a URL do Webhook.', 'error');
    } finally {
      setTestingWebhook(false);
    }
  };

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
          <p className="text-slate-500 font-medium">Altere o nome, logo e outras informações da sua câmara.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          {/* Section: Dados da Instituição */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <h4>Informações da Câmara</h4>
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
                    placeholder="Ex: Câmara de Arbitragem de São Paulo"
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
                    placeholder="00.000.000/0000-00"
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
                    placeholder="Nome completo do Presidente"
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
                    placeholder="(00) 00000-0000"
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
                    placeholder="Ex: Rua das Flores, 123, Sala 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:col-span-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={bairro} 
                    onChange={e => setBairro(e.target.value)} 
                    required 
                    placeholder="Ex: Centro"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={cidade} 
                    onChange={e => setCidade(e.target.value)} 
                    required 
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado (UF)</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all uppercase" 
                    value={estado} 
                    onChange={e => setEstado(e.target.value)} 
                    required 
                    placeholder="Ex: SP"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                    value={cep} 
                    onChange={e => setCep(e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"))} 
                    required 
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Logotipo */}
          <div className="p-8 md:p-10 space-y-8 bg-slate-50/30">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ImageIcon size={24} />
              </div>
              <h4>Logo da Câmara</h4>
            </div>
            
            <div className="flex flex-col md:flex-row items-start gap-10">
              <div className="flex-1 space-y-6">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Faça o upload da logomarca da sua Câmara. Recomendamos arquivos com fundo transparente (PNG) e boa resolução. Esta logo será exibida no cabeçalho e nos documentos gerados.
                </p>
                
                <div className="relative group">
                  <input 
                    type="file" 
                    id="logo-upload"
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                      <UploadCloud size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Clique para fazer upload</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG ou SVG (Máx. 2MB)</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="w-full md:w-72 shrink-0">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 ml-1">Visualização no Sistema</label>
                <div className="aspect-video bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-6 shadow-sm overflow-hidden relative group">
                  {logo ? (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={logo} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon size={40} className="mx-auto text-slate-200" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Sem logo definida</span>
                    </div>
                  )}
                  {logo && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => setLogo('')}
                        className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Section: Integrações */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-xl tracking-tight">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Zap size={24} />
              </div>
              <h4>Conectar outros sistemas</h4>
            </div>
            
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-sm text-purple-900 leading-relaxed">
              <p className="font-bold flex items-center gap-2 mb-2">
                <AlertCircle size={18} />
                Como enviar dados para outros sistemas?
              </p>
              Configure o disparo de notificações automáticas para plataformas externas (Make, Zapier, etc) sempre que um novo processo for protocolado.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL do Webhook</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="url" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" 
                      placeholder="https://hooks.zapier.com/..." 
                      value={webhookUrl} 
                      onChange={e => setWebhookUrl(e.target.value)} 
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingWebhook}
                    onClick={handleTestWebhook}
                    className="px-4 py-3 bg-white border border-slate-200 text-purple-600 rounded-xl text-xs font-bold hover:bg-purple-50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {testingWebhook ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <Zap size={16} />
                    )}
                    Testar
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Token de Autorização</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" 
                    placeholder="Bearer token..." 
                    value={webhookToken} 
                    onChange={e => setWebhookToken(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 bg-slate-50 flex justify-end gap-4">
            <button 
              type="button"
              className="px-8 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-all"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

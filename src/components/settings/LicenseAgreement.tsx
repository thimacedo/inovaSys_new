import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';
import { supabase } from '../../lib/supabase';

interface LicenseAgreementProps {
  camaraId: string;
  onSuccess?: () => void;
}

/**
 * Componente de Termo de Licença de Uso (SaaS)
 * Estilizado seguindo os padrões MD3 Elevated Card.
 */
export const LicenseAgreement: React.FC<LicenseAgreementProps> = ({ camaraId, onSuccess }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      // Obter IP do usuário para auditoria
      let ip = 'IP_NAO_IDENTIFICADO';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (ipErr) {
        console.warn('Não foi possível identificar o IP:', ipErr);
      }
      
      const timestamp = new Date().toISOString();
      const acceptanceData = `${timestamp} | IP: ${ip}`;

      // Salva o aceite no Supabase na tabela public.camaras
      const { error } = await supabase
        .from('camaras')
        .update({ 
          license_accepted_at: acceptanceData
        })
        .eq('id', camaraId);

      if (error) throw error;
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar adesão à licença:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MD3Card variant="elevated" className="max-w-4xl mx-auto !p-0 overflow-hidden border border-md-outline/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho Jurídico */}
      <div className="bg-md-primary/5 p-8 border-b border-md-outline/10 flex items-center gap-6">
        <div className="p-4 bg-md-primary text-md-on-primary rounded-[24px] shadow-lg shadow-md-primary/20">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-md-on-surface tracking-tight">Termo de Licença de Uso</h2>
          <p className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.3em] mt-1">Acordo de Software como Serviço (SaaS) v2.5</p>
        </div>
      </div>

      <div className="p-10 space-y-10">
        {/* Corpo do Contrato */}
        <div className="h-[420px] overflow-y-auto pr-8 space-y-8 text-sm leading-relaxed text-md-on-surface-variant/80 font-medium custom-scrollbar selection:bg-md-primary/20">
          <section className="space-y-3">
            <h3 className="font-black text-md-on-surface text-base uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 bg-md-primary rounded-full"></span>
              1. Objeto da Licença
            </h3>
            <p>
              Este Termo de Licença de Uso de Software ("Termo") estabelece as condições sob as quais a <strong>InovaSys Tecnologia</strong> ("Licenciante") concede ao usuário ("Licenciado") uma licença de uso, não exclusiva e intransferível, para utilização do ecossistema InovaSys conforme as cláusulas aqui estabelecidas.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-md-on-surface text-base uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 bg-md-secondary rounded-full"></span>
              2. Propriedade Intelectual
            </h3>
            <p>
              O Software, incluindo todo o seu código-fonte, algoritmos, arquitetura de microserviços, design visual, bancos de dados e documentação técnica associada, é propriedade intelectual exclusiva da Licenciante, protegida pelas leis de direitos autorais e tratados internacionais de propriedade intelectual.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-md-on-surface text-base uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 bg-md-tertiary rounded-full"></span>
              3. Obrigações e Responsabilidades
            </h3>
            <p>
              O Licenciado compromete-se a utilizar o software estritamente para fins institucionais e legais. É terminantemente vedada qualquer tentativa de engenharia reversa, sublicenciamento não autorizado, extração massiva de dados sem consentimento ou qualquer prática que comprometa a estabilidade e segurança da infraestrutura compartilhada.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-md-on-surface text-base uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-6 bg-md-error rounded-full"></span>
              4. Privacidade e Proteção de Dados (LGPD)
            </h3>
            <p>
              Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, a Licenciante implementa rigorosas medidas técnicas e administrativas para garantir o sigilo e a integridade das informações. O tratamento de dados pessoais ocorre estritamente para a execução do serviço contratado.
            </p>
          </section>

          <div className="p-6 bg-md-surface-variant/30 rounded-3xl border border-md-outline/5 italic text-xs border-l-4 border-l-md-primary">
            Nota de Aceite Digital: Ao clicar em "Confirmar Adesão", o sistema registrará automaticamente seu endereço IP e timestamp como evidência jurídica de concordância plena com estes termos.
          </div>
        </div>

        {/* Controles de Aceite */}
        <div className="pt-10 border-t border-md-outline/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <label className="flex items-center gap-5 cursor-pointer group select-none transition-all">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer hidden" 
                checked={accepted}
                onChange={() => setAccepted(!accepted)}
              />
              <div className="w-8 h-8 border-2 border-md-outline rounded-[12px] peer-checked:bg-md-primary peer-checked:border-md-primary transition-all duration-300 flex items-center justify-center group-hover:border-md-primary/50 group-hover:shadow-lg group-hover:shadow-md-primary/10">
                <CheckCircle size={20} className="text-md-on-primary scale-0 peer-checked:scale-100 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-md-on-surface group-hover:text-md-primary transition-colors uppercase tracking-widest">
                Li e concordo com os termos
              </span>
              <span className="text-[10px] text-md-on-surface-variant opacity-60">Aceite obrigatório para prosseguir</span>
            </div>
          </label>

          <button 
            onClick={handleConfirm}
            disabled={!accepted || loading}
            className={`
              rounded-[28px] px-12 py-5 font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-4 shadow-xl active:scale-95
              ${accepted && !loading 
                ? 'bg-md-primary text-md-on-primary hover:shadow-2xl hover:shadow-md-primary/30 hover:brightness-110' 
                : 'bg-md-surface-variant text-md-on-surface-variant/30 cursor-not-allowed'}
            `}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
            Confirmar Adesão
          </button>
        </div>
      </div>
    </MD3Card>
  );
};

import React, { useState } from 'react';
import { usePublicConsultation } from '../presentation/hooks/usePublicConsultation';
import { Search, ShieldCheck, FileText, X, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../presentation/ui/components/Button';
import { motion } from 'motion/react';

export const PublicConsultation: React.FC = () => {
  const [numProcesso, setNumProcesso] = useState('');
  const [codValidacao, setCodValidacao] = useState('');
  const { consultar, resultado, isLoading, error: hookError, reset } = usePublicConsultation();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const data = await consultar({
        numeroProcesso: numProcesso,
        codigoValidacao: codValidacao
      });

      if (data.error) {
        setLocalError(data.error);
      }
    } catch (err: any) {
      setLocalError('Falha na comunicação com o servidor de validação.');
    }
  };

  const currentError = localError || (hookError ? (hookError.message || 'Erro inesperado') : null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 text-blue-600 mb-4">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Validação de <span className="text-blue-600">Sentenças</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">Verifique a autenticidade e a integridade de documentos emitidos pelas Câmaras Arbitrais InovaSys.</p>
        </div>

        {!resultado || resultado.error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50"
          >
            <form onSubmit={handleConsultar} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Número do Processo</label>
                  <div className="relative">
                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type="text" 
                      value={numProcesso}
                      onChange={(e) => setNumProcesso(e.target.value)}
                      placeholder="Ex: 2026.001.0001"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código de Validação (Hash)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type="text" 
                      value={codValidacao}
                      onChange={(e) => setCodValidacao(e.target.value)}
                      placeholder="Insira o código impresso na sentença"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {currentError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center animate-shake">
                  {currentError}
                </div>
              )}

              <Button 
                type="submit" 
                isLoading={isLoading}
                size="lg" 
                className="w-full py-6 text-sm"
                icon={Search}
              >
                Verificar Autenticidade
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-10 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <CheckCircle size={32} />
                <div>
                  <h2 className="text-xl font-black uppercase italic">Documento Autêntico</h2>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Validado pela Rede InovaSys em {new Date(resultado.data_conclusao).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <button onClick={() => reset()} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Processo</span>
                  <p className="text-lg font-black text-slate-900">{resultado.numero_processo}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Requerente</span>
                  <p className="text-lg font-black text-slate-900">{resultado.requerente_nome}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Requerido</span>
                  <p className="text-lg font-black text-slate-900">{resultado.requerido_nome}</p>
                </div>
              </div>

              <div className="p-10 bg-white border border-slate-200 rounded-3xl shadow-inner max-h-[400px] overflow-auto leading-relaxed text-slate-700 font-serif prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: resultado.conteudo_html }} />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Assinado Digitalmente por</p>
                    <p className="text-sm font-bold text-slate-900">{resultado.assinado_por}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Código de Integridade</p>
                  <p className="text-[10px] font-mono font-bold text-blue-600">{resultado.hash_validacao}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            InovaSys Enterprise Legal Tech <ExternalLink size={10} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicConsultation;

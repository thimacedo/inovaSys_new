import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface Deployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  creator: {
    username: string;
  };
  meta?: {
    githubCommitMessage?: string;
  };
}

export default function VercelManager() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vercel/deployments');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Erro ao buscar deployments');
      }
      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    // Poll every 10 seconds if there's a deployment in progress
    const interval = setInterval(() => {
      setDeployments(current => {
        const hasInProgress = current.some(d => ['BUILDING', 'INITIALIZING', 'QUEUED'].includes(d.state));
        if (hasInProgress) {
          fetchDeployments();
        }
        return current;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const triggerDeploy = async () => {
    if (!window.confirm('Tem certeza que deseja forçar uma nova atualização do sistema? Isso pode causar instabilidade momentânea.')) {
      return;
    }
    
    setIsDeploying(true);
    setError(null);
    try {
      const response = await fetch('/api/vercel/deploy', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Erro ao iniciar deploy');
      }
      
      // Refresh list after triggering
      setTimeout(fetchDeployments, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'READY': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'ERROR':
      case 'CANCELED': return <XCircle className="text-red-500" size={20} />;
      case 'BUILDING':
      case 'INITIALIZING':
      case 'QUEUED': return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      default: return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'READY': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ERROR':
      case 'CANCELED': return 'bg-red-100 text-red-700 border-red-200';
      case 'BUILDING':
      case 'INITIALIZING':
      case 'QUEUED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="text-slate-700" />
            Status do Sistema (Vercel)
          </h2>
          <p className="text-slate-500 mt-1">Gerencie as atualizações e builds do sistema em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDeployments}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            onClick={triggerDeploy}
            disabled={isDeploying || isLoading}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Server size={18} />
            {isDeploying ? 'Iniciando...' : 'Forçar Novo Build'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold">Erro na comunicação com a Vercel</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Últimos Deploys</h3>
        </div>
        
        {isLoading && deployments.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw size={32} className="animate-spin mb-4 text-slate-300" />
            <p>Carregando histórico de atualizações...</p>
          </div>
        ) : deployments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum deploy encontrado para este projeto.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {deployments.map((deploy) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={deploy.uid} 
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStateIcon(deploy.state)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">
                        {deploy.meta?.githubCommitMessage || 'Atualização Manual / API'}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStateColor(deploy.state)}`}>
                        {deploy.state}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-3">
                      <span>{new Date(deploy.created).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>por {deploy.creator?.username || 'Sistema'}</span>
                    </div>
                  </div>
                </div>
                
                {deploy.url && deploy.state === 'READY' && (
                  <a 
                    href={`https://${deploy.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Visitar <ExternalLink size={14} />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

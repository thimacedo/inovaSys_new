import { useState, useEffect } from 'react';
import { auditService, AuditLog } from '../services/auditService';
import { useModal } from '../context/ModalContext';

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { showToast } = useModal();

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await auditService.getAll();
      setLogs(data);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('relation "auditoria" does not exist')) {
        setErrorMsg('A tabela "auditoria" não existe no banco de dados. Por favor, execute o script SQL de criação da tabela.');
      } else {
        setErrorMsg(`Erro ao carregar auditoria: ${e.message || JSON.stringify(e)}`);
        showToast("Erro ao carregar auditoria", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Auditoria do Sistema
        </h2>
        <button 
          onClick={carregarLogs}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Atualizar
        </button>
      </div>

      {errorMsg ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Atenção Necessária
          </h3>
          <p className="mb-4">{errorMsg}</p>
          <div className="bg-white p-4 rounded border border-amber-100 overflow-x-auto text-sm font-mono">
            <pre>{`-- Execute este SQL no Supabase (SQL Editor)
create table public.auditoria (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references auth.users not null,
  usuario_nome text,
  acao text not null,
  detalhes jsonb default '{}'::jsonb,
  data_hora timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.auditoria enable row level security;

-- Política de leitura para administradores
create policy "Admins podem ler auditoria"
  on public.auditoria for select
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('god', 'admin')
    )
  );

-- Política de inserção para usuários autenticados
create policy "Usuários autenticados podem inserir auditoria"
  on public.auditoria for insert
  with check (auth.uid() = usuario_id);
`}</pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-slate-500 font-medium">Carregando logs de auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatarData(log.data_hora)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{log.usuario_nome}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]" title={log.usuario_id}>{log.usuario_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {log.acao}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 max-w-md overflow-x-auto">
                          {JSON.stringify(log.detalhes, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

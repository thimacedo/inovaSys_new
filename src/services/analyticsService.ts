import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalProcessos: number;
  taxaCongestionamento: number;
  tempoMedioDias: number;
  valorTotalEnvolvido: number;
  processosPorStatus: Array<{ status: string; count: number }>;
  processosPorMes: Array<{ mes: string; count: number }>;
  processosPorArbitro: Array<{ arbitro: string; count: number }>;
  processosRecentes: Array<{ id: string; numero?: string; titulo?: string; status?: string; created_at?: string }>;
}

export const analyticsService = {
  async getDashboardMetrics(
    camaraId: string,
    dataInicio?: string,
    dataFim?: string
  ): Promise<DashboardMetrics> {
    let query = supabase
      .from('processos')
      .select('*', { count: 'exact', head: false })
      .eq('camara_id', camaraId);

    if (dataInicio) query = query.gte('created_at', dataInicio);
    if (dataFim) query = query.lte('created_at', dataFim);

    const { data: processos, count, error } = await query;
    if (error) throw error;

    // Calcular métricas
    const totalProcessos = count || 0;
    const concluidos = processos?.filter(p => p.status === 'concluido' || p.status === 'arquivado').length || 0;
    const emAndamento = processos?.filter(p => p.status !== 'concluido' && p.status !== 'arquivado').length || 0;
    const taxaCongestionamento = totalProcessos > 0 ? (emAndamento / totalProcessos) * 100 : 0;

    // Tempo médio (simplificado - pode usar coluna data_conclusao)
    let tempoMedioDias = 0;
    if (processos) {
      const concluidosComData = processos.filter(p => p.data_conclusao && p.created_at);
      if (concluidosComData.length > 0) {
        const somaDias = concluidosComData.reduce((acc, p) => {
          const inicio = new Date(p.created_at);
          const fim = new Date(p.data_conclusao);
          return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        tempoMedioDias = somaDias / concluidosComData.length;
      }
    }

    // Valor total envolvido (se existir campo valor_causa)
    const valorTotal = processos?.reduce((acc, p) => acc + (p.valor_causa || 0), 0) || 0;

    // Processos por status
    const statusMap = new Map<string, number>();
    processos?.forEach(p => {
      const s = p.status || 'indefinido';
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    });
    const processosPorStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Evolução mensal (últimos 12 meses)
    const monthlyMap = new Map<string, number>();
    const hoje = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
    }
    processos?.forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, monthlyMap.get(key)! + 1);
      }
    });
    const processosPorMes = Array.from(monthlyMap.entries()).map(([mes, count]) => ({ mes, count }));

    // Processos por árbitro (top 10)
    const arbitroMap = new Map<string, number>();
    const { data: arbitrosData } = await supabase
      .from('processos')
      .select('arbitro_id, arbitro:arbitro_id(nome)')
      .eq('camara_id', camaraId);
    arbitrosData?.forEach((p: { arbitro?: { nome?: string } | null }) => {
      const nome = p.arbitro?.nome || 'Não atribuído';
      arbitroMap.set(nome, (arbitroMap.get(nome) || 0) + 1);
    });
    const processosPorArbitro = Array.from(arbitroMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([arbitro, count]) => ({ arbitro, count }));

    // Processos recentes (últimos 5)
    const { data: recentes } = await supabase
      .from('processos')
      .select('id, numero, titulo, status, created_at')
      .eq('camara_id', camaraId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalProcessos,
      taxaCongestionamento,
      tempoMedioDias,
      valorTotalEnvolvido: valorTotal,
      processosPorStatus,
      processosPorMes,
      processosPorArbitro,
      processosRecentes: recentes || [],
    };
  },
};
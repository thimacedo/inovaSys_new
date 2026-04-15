import { supabase } from '../lib/supabase';

export const efficiencyService = {
  /**
   * Coleta métricas globais de eficiência mecânica e conformidade.
   */
  getGlobalMetrics: async (organizationId?: string) => {
    try {
      // 1. Total de Anexos vs Classificados (Eficiência OCR/IA)
      const { count: totalAnexos } = await supabase
        .from('anexos')
        .select('*', { count: 'exact', head: true });

      const { count: anexosClassificados } = await supabase
        .from('anexos')
        .select('*', { count: 'exact', head: true })
        .not('categoria', 'is', null);

      // 2. Total de Logs de Visualização (Compliance LGPD)
      const { count: totalVisualizacoes } = await supabase
        .from('logs_visualizacao')
        .select('*', { count: 'exact', head: true });

      // 3. Ações Críticas (Auditoria do Sistema)
      const { count: totalAuditoria } = await supabase
        .from('auditoria')
        .select('*', { count: 'exact', head: true });

      // 4. Atividades Recentes de IA
      const { data: recentIA } = await supabase
        .from('anexos')
        .select('id, nome_arquivo, categoria, created_at')
        .not('categoria', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      // 5. Métricas Financeiras
      const { count: totalCalculosFinanceiros } = await supabase
        .from('financeiro')
        .select('*', { count: 'exact', head: true });

      const { data: valorTotalPagoResult } = await supabase
        .from('financeiro')
        .select('valor')
        .eq('status', 'Pago');

      const valorTotalPagoFinanceiro = valorTotalPagoResult
        ? valorTotalPagoResult.reduce((sum, item) => sum + item.valor, 0)
        : 0;

      return {
        efficiency: {
          totalAnexos: totalAnexos || 0,
          anexosClassificados: anexosClassificados || 0,
          percentualAutomacao: totalAnexos ? Math.round((anexosClassificados! / totalAnexos!) * 100) : 0
        },
        compliance: {
          totalVisualizacoes: totalVisualizacoes || 0,
          totalAuditoria: totalAuditoria || 0
        },
        recentIA: recentIA || [],
        finance: {
          totalCalculosFinanceiros: totalCalculosFinanceiros || 0,
          valorTotalPagoFinanceiro: valorTotalPagoFinanceiro
        }
      };
    } catch (e) {
      console.error('[EfficiencyService] Erro ao buscar métricas:', e);
      throw e;
    }
  }
};

export default efficiencyService;

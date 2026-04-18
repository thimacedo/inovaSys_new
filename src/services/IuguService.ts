import { supabase } from '../lib/supabase';
import { financialCalculatorService } from './financialCalculatorService';

/**
 * 💰 IUGU SERVICE - GESTÃO DE PAGAMENTOS E SPLIT (INOVASYS FASE 6)
 * Realiza a orquestração financeira entre Plataforma, Câmara e Árbitros.
 */

interface IuguAccountCreate {
  name: string;
  commission_percent: number;
}

interface IuguInvoiceRequest {
  email: string;
  amount: number; // Valor em reais
  description: string;
  processo_id: string;
  organization_id: string;
}

export const iuguService = {
  /**
   * Cria uma subconta na Iugu para uma nova Câmara cadastrada.
   * Isso permite que a Câmara receba pagamentos diretamente.
   */
  criarSubconta: async (camaraId: string, nome: string) => {
    try {
      console.log(`[IuguService] Criando subconta para câmara: ${nome}`);
      
      // Simulação da chamada de API da Iugu (Account Creation)
      const mockIuguId = `iugu_acc_${Math.random().toString(36).substring(7)}`;

      // Salva o ID da Iugu no registro da Câmara no Supabase
      const { error } = await supabase
        .from('camaras')
        .update({ iugu_account_id: mockIuguId })
        .eq('id', camaraId);

      if (error) throw error;

      return { iugu_id: mockIuguId, status: 'pending_verification' };
    } catch (error) {
      console.error('[IuguService] Falha ao criar subconta:', error);
      throw error;
    }
  },

  /**
   * Gera uma fatura com regras de Split (Divisão de valores).
   * Automatizado via financialCalculatorService.
   */
  criarFaturaComSplit: async (request: IuguInvoiceRequest) => {
    try {
      console.log(`[IuguService] Gerando fatura com split para processo: ${request.processo_id}`);

      // 1. Captura de IDs de Recebedores Reais
      
      // Plataforma (ID Master configurado no ambiente)
      const plataformaIuguId = import.meta.env.VITE_IUGU_PLATFORM_ID || 'MASTER_ID';

      // Busca dados da Câmara (Taxas e Conta Iugu)
      const { data: camara } = await supabase
        .from('camaras')
        .select('iugu_account_id, plataforma_taxa, camara_taxa, camara_valor_fixo')
        .eq('id', request.organization_id)
        .single();

      // Busca o Árbitro do processo para obter seu ID Iugu
      const { data: processo } = await supabase
        .from('processos')
        .select('arbitro_id')
        .eq('id', request.processo_id)
        .single();

      let arbitroIuguId = null;
      if (processo?.arbitro_id) {
        const { data: arbitroProfile } = await supabase
          .from('perfis')
          .select('iugu_account_id')
          .eq('id', processo.arbitro_id)
          .single();
        arbitroIuguId = arbitroProfile?.iugu_account_id;
      }

      // 2. Cálculo do Split usando o serviço especializado
      const splitConfig = {
        plataformaIuguId,
        camaraIuguId: camara?.iugu_account_id,
        arbitroIuguId,
        plataformaTaxa: camara?.plataforma_taxa,
        camaraTaxa: camara?.camara_taxa,
        camaraValorFixo: camara?.camara_valor_fixo
      };

      const splitResult = financialCalculatorService.calculateSplit(request.amount, splitConfig);

      // 3. Preparação do Payload para a Iugu
      const payload = {
        email: request.email,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
        items: [{
          description: request.description,
          quantity: 1,
          price_cents: splitResult.total_cents
        }],
        payment_methods: ["pix", "bank_slip", "credit_card"],
        // No Marketplace Iugu, o split_rules define quem recebe o quê
        split_rules: splitResult.splits.map(s => ({
          recipient_account_id: s.recipient_id,
          cents: s.cents
        }))
      };

      // Simulação de chamada POST https://api.iugu.com/v1/invoices
      const mockInvoice = {
        id: `inv_${Math.random().toString(36).substring(7)}`,
        url: 'https://iugu.com/i/mock_invoice_url',
        pix_qrcode: 'mock_pix_payload'
      };

      // 4. Registrar a fatura no histórico financeiro
      await supabase.from('financeiro_registros').insert({
        processo_id: request.processo_id,
        organization_id: request.organization_id,
        descricao: request.description,
        valor: request.amount,
        status: 'Pendente',
        gateway_id: mockInvoice.id,
        metadata: { 
          checkout_url: mockInvoice.url, 
          type: 'iugu_split_automated',
          split_breakdown: splitResult.splits 
        }
      });

      return mockInvoice;
    } catch (error) {
      console.error('[IuguService] Erro ao gerar fatura com split:', error);
      throw error;
    }
  },

  /**
   * Processa o Webhook de pagamento recebido da Iugu.
   */
  processarWebhook: async (event: any) => {
    const { event: eventName, data } = event;

    if (eventName === 'invoice.status_changed' && data.status === 'paid') {
      console.log(`[IuguService] Pagamento confirmado para fatura: ${data.id}`);
      
      // Atualiza o registro no Supabase
      const { error } = await supabase
        .from('financeiro_registros')
        .update({ status: 'Pago', data_pagamento: new Date().toISOString() })
        .eq('gateway_id', data.id);

      if (error) console.error('[IuguService] Erro ao liquidar fatura no DB:', error);
    }
  }
};

export default iuguService;

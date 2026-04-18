import { supabase } from '../lib/supabase';

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
  amount_cents: number;
  description: string;
  processo_id: string;
  organization_id: string;
  split_rules: {
    recipient_id: string;
    percentage: number;
  }[];
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
      // POST https://api.iugu.com/v1/marketplace/create_account
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
   */
  criarFaturaComSplit: async (request: IuguInvoiceRequest) => {
    try {
      console.log(`[IuguService] Gerando fatura com split para processo: ${request.processo_id}`);

      // 1. Preparação do Payload com Regras de Split (Plataforma vs Câmara)
      const payload = {
        email: request.email,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
        items: [{
          description: request.description,
          quantity: 1,
          price_cents: request.amount_cents
        }],
        payment_methods: ["pix", "bank_slip", "credit_card"],
        splits: request.split_rules.map(rule => ({
          recipient_account_id: rule.recipient_id,
          percentage: rule.percentage
        }))
      };

      // Simulação de chamada POST https://api.iugu.com/v1/invoices
      const mockInvoice = {
        id: `inv_${Math.random().toString(36).substring(7)}`,
        url: 'https://iugu.com/i/mock_invoice_url',
        pix_qrcode: 'mock_pix_payload'
      };

      // 2. Registrar a fatura no histórico financeiro do InovaSys
      await supabase.from('financeiro_registros').insert({
        processo_id: request.processo_id,
        organization_id: request.organization_id,
        descricao: request.description,
        valor: request.amount_cents / 100,
        status: 'Pendente',
        gateway_id: mockInvoice.id,
        metadata: { checkout_url: mockInvoice.url, type: 'iugu_split' }
      });

      return mockInvoice;
    } catch (error) {
      console.error('[IuguService] Erro ao gerar fatura:', error);
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

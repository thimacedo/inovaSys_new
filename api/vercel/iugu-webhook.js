import { createClient } from '@supabase/supabase-js';

/**
 * Webhook de Liquidação Financeira da Iugu.
 * Recebe notificações de alteração de status de faturas e liquida no banco de dados.
 */
export default async function handler(req, res) {
  // 1. Recebimento: Apenas POST é permitido pela Iugu
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const payload = req.body;
  const { event, data } = payload;

  console.log(`[Iugu Webhook] Evento recebido: ${event} para fatura: ${data?.id}`);

  // 2. Filtragem: Processar apenas se for fatura paga
  if (event !== 'invoice.status_changed' || data?.status !== 'paid') {
    return res.status(200).json({ status: 'ignored', message: 'Evento não relevante para liquidação' });
  }

  try {
    // Configurações do Supabase via Variáveis de Ambiente
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurações do Supabase não encontradas no ambiente.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Supabase Integration: Localizar e atualizar o registro financeiro
    const { data: updatedRecord, error: dbError } = await supabase
      .from('financeiro_registros')
      .update({ 
        status: 'Pago', 
        data_pagamento: new Date().toISOString() 
      })
      .eq('gateway_id', data.id)
      .select()
      .single();

    if (dbError) {
      console.error('[Iugu Webhook] Erro ao atualizar Supabase:', dbError);
      return res.status(500).json({ error: 'Erro ao atualizar banco de dados' });
    }

    if (!updatedRecord) {
      console.warn(`[Iugu Webhook] Registro não encontrado para gateway_id: ${data.id}`);
      return res.status(404).json({ error: 'Registro financeiro não localizado' });
    }

    // 4. Notificação: Enviar e-mail interno (replicando a lógica do email.js)
    const resendApiKey = process.env.RESEND_API_KEY;
    const internalEmail = process.env.SMTP_USER || 'inovasyscamara@gmail.com';

    if (resendApiKey) {
      const subject = `💰 Liquidação Confirmada: Fatura ${data.id}`;
      const html = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; padding: 20px;">
          <h2 style="color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">Liquidação de Fatura Iugu</h2>
          <p>Olá, o sistema detectou uma nova liquidação financeira via Iugu.</p>
          <div style="background-color: #f1f8e9; padding: 15px; border-radius: 8px;">
            <ul>
              <li><strong>Fatura Iugu:</strong> ${data.id}</li>
              <li><strong>Status:</strong> Confirmado (Pago)</li>
              <li><strong>Data de Liquidação:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Valor Processado:</strong> ${data.total || 'Verificar painel'}</li>
            </ul>
          </div>
          <p style="margin-top: 20px;">O registro no sistema <strong>InovaSys</strong> foi atualizado com sucesso para status <em>Pago</em>.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Notificação automática gerada por InovaSys Webhook Service.</small>
        </div>
      `;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'InovaSys Notificações <onboarding@resend.dev>',
            to: [internalEmail],
            subject: subject,
            html: html
          })
        });
        console.log(`[Iugu Webhook] Notificação enviada para ${internalEmail}`);
      } catch (emailErr) {
        console.error('[Iugu Webhook] Falha ao enviar notificação de e-mail:', emailErr);
      }
    }

    return res.status(200).json({ 
      status: 'success', 
      message: 'Fatura liquidada e notificação processada',
      record_id: updatedRecord.id 
    });

  } catch (err) {
    console.error('[Iugu Webhook] Erro crítico no processamento:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

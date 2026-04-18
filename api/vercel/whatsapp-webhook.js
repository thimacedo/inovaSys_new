import { createClient } from '@supabase/supabase-js';

/**
 * WhatsApp Webhook Receiver - InovaSys v2.0
 * Recebe confirmações de entrega e leitura da Meta Cloud API.
 */
export default async function handler(req, res) {
  // Verificação de Verificação da Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VITE_WHATSAPP_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // Processamento de Eventos (POST)
  if (req.method === 'POST') {
    const body = req.body;
    
    // Filtro para mensagens lidas
    const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses;
    if (statuses && statuses[0]?.status === 'read') {
      const waId = statuses[0].id;
      
      try {
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // Atualiza a timeline marcando a visualização
        const { error } = await supabase
          .from('historico_processo')
          .update({ 
            status_notificacao: 'Visualizado pela Parte',
            visualizado_em: new Date().toISOString()
          })
          .contains('metadata', { whatsapp_id: waId });

        if (error) throw error;
        console.log(`[WA Webhook] Notificação ${waId} marcada como lida.`);
      } catch (err) {
        console.error('[WA Webhook] Erro ao atualizar status:', err);
      }
    }

    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).end();
}

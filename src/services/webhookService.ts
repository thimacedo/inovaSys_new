export interface WebhookPayload {
  processo_id: string;
  numero_processo?: string;
  contato_nome: string;
  mensagem: string;
  metadata?: any;
}

export const webhookService = {
  /**
   * Envia uma notificação via Webhook (preparado para WhatsApp/Integração externa).
   */
  notify: async (event: 'status_change' | 'nova_mensagem' | 'nova_audiencia', payload: WebhookPayload) => {
    const url = import.meta.env.VITE_WHATSAPP_WEBHOOK_URL;
    if (!url) {
      console.warn('[WebhookService] VITE_WHATSAPP_WEBHOOK_URL não configurada.');
      return;
    }

    const maxRetries = 3;
    let attempt = 0;

    const body = {
      event,
      timestamp: new Date().toISOString(),
      ...payload
    };

    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          console.log(`[WebhookService] Evento ${event} enviado com sucesso.`);
          return;
        }
        
        throw new Error(`HTTP Error ${response.status}`);
      } catch (error) {
        attempt++;
        console.warn(`[WebhookService] Tentativa ${attempt} falhou:`, error);
        if (attempt >= maxRetries) break;
        // Delay incremental
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
};

export default webhookService;

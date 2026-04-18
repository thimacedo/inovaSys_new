/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface WhatsAppPayload {
  to: string;
  nome: string;
  processo: string;
  link: string;
  valor?: string;
  vencimento?: string;
  data_hora?: string;
}

/**
 * Serviço de Integração com a Meta Cloud API (WhatsApp Business).
 * Responsável pelo envio de notificações transacionais via templates oficiais.
 * Utiliza as variáveis de ambiente: VITE_WHATSAPP_TOKEN e VITE_WHATSAPP_PHONE_NUMBER_ID.
 */
export class WhatsAppService {
  private static readonly API_URL = 'https://graph.facebook.com/v21.0';
  private static readonly TOKEN = import.meta.env.VITE_WHATSAPP_TOKEN;
  private static readonly PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

  /**
   * Envia uma notificação de nova movimentação processual.
   * Utiliza o template oficial 'novo_andamento' com parâmetros de corpo.
   */
  static async notificarMovimentacao(payload: WhatsAppPayload): Promise<void> {
    await this.enviarTemplate('novo_andamento', payload.to, [
      { type: 'text', text: payload.nome },
      { type: 'text', text: payload.processo },
      { type: 'text', text: payload.link },
    ]);
  }

  /**
   * Envia uma notificação de fatura ou custas geradas.
   * Utiliza o template 'fatura_gerada'.
   */
  static async notificarCobranca(payload: WhatsAppPayload): Promise<void> {
    await this.enviarTemplate('fatura_gerada', payload.to, [
      { type: 'text', text: payload.nome },
      { type: 'text', text: payload.processo },
      { type: 'text', text: payload.valor || '0,00' },
      { type: 'text', text: payload.vencimento || '' },
      { type: 'text', text: payload.link },
    ]);
  }

  /**
   * Envia uma notificação de audiência agendada.
   * Utiliza o template 'audiencia_agendada'.
   */
  static async notificarAudiencia(payload: WhatsAppPayload): Promise<void> {
    await this.enviarTemplate('audiencia_agendada', payload.to, [
      { type: 'text', text: payload.nome },
      { type: 'text', text: payload.processo },
      { type: 'text', text: payload.data_hora || '' },
      { type: 'text', text: payload.link },
    ]);
  }

  /**
   * Método genérico para envio de templates via Meta API.
   */
  private static async enviarTemplate(templateName: string, to: string, parameters: any[]): Promise<void> {
    if (!this.TOKEN || !this.PHONE_NUMBER_ID) {
      console.error('[WhatsAppService] Falha na configuração: Variáveis de ambiente ausentes.');
      return;
    }

    const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;

    try {
      const cleanPhone = to.replace(/\D/g, '');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'pt_BR' },
            components: [{ type: 'body', parameters }],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
      }

      console.log(`[WhatsAppService] Template '${templateName}' enviado para ${cleanPhone}`);
    } catch (error) {
      console.error(`[WhatsAppService] Falha no envio do template '${templateName}':`, error);
    }
  }
}

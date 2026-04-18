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
   * 
   * @param payload Dados para preenchimento do template.
   */
  static async notificarMovimentacao(payload: WhatsAppPayload): Promise<void> {
    if (!this.TOKEN || !this.PHONE_NUMBER_ID) {
      console.error('[WhatsAppService] Falha na configuração: Variáveis de ambiente ausentes.');
      return;
    }

    const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;

    try {
      // Normalização do número de telefone (apenas dígitos)
      const cleanPhone = payload.to.replace(/\D/g, '');

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
            name: 'novo_andamento',
            language: {
              code: 'pt_BR',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: payload.nome },
                  { type: 'text', text: payload.processo },
                  { type: 'text', text: payload.link },
                ],
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
      }

      console.log(`[WhatsAppService] Notificação enviada para ${cleanPhone}`);
    } catch (error) {
      console.error('[WhatsAppService] Falha crítica no envio da notificação:', error);
      // Mantemos a falha em log para não interromper a UX do usuário final
    }
  }
}

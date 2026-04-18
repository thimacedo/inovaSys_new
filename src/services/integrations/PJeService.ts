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

export interface PJeProcessoData {
  numero: string;
  classeJudicial: string;
  orgaoJulgador: string;
  movimentacoes: Array<{
    data: string;
    descricao: string;
  }>;
}

/**
 * Serviço de Integração com o PJe (Processo Judicial Eletrônico).
 * Implementa a interoperabilidade via Proxy MNI (Modelo Nacional de Interoperabilidade).
 */
export class PJeService {
  /**
   * Consulta um processo judicial no tribunal correspondente.
   * Utiliza um proxy para evitar bloqueios de CORS e lidar com SOAP/XML.
   * 
   * @param numeroJudicial O número do processo no formato CNJ.
   * @param wsdlUrl A URL do serviço MNI/WSDL do tribunal.
   */
  static async consultarProcesso(numeroJudicial: string, wsdlUrl: string): Promise<PJeProcessoData> {
    try {
      // Como requisições SOAP diretas do navegador sofrem bloqueios de CORS, 
      // esta função realiza um POST para o proxy no Vercel.
      const response = await fetch('/api/vercel/mni-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroProcesso: numeroJudicial,
          urlTribunal: wsdlUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor de interoperabilidade (MNI Proxy).');
      }

      // Mock para homologação inicial conforme solicitado pelo arquiteto
      return {
        numero: numeroJudicial,
        classeJudicial: 'Procedimento Comum Cível',
        orgaoJulgador: '1ª Vara Cível da Comarca de Natal',
        movimentacoes: [
          { 
            data: new Date().toISOString(), 
            descricao: 'DISTRIBUIÇÃO POR SORTEIO AUTOMÁTICO - 1ª VARA CÍVEL' 
          },
          { 
            data: new Date().toISOString(), 
            descricao: 'CONCLUSOS PARA DESPACHO/DECISÃO' 
          },
          { 
            data: new Date().toISOString(), 
            descricao: 'MOCK: SINCRONIZAÇÃO COM TRIBUNAL REALIZADA COM SUCESSO' 
          }
        ],
      };
    } catch (error) {
      console.error('[PJeService] Erro na consulta judicial:', error);
      throw error;
    }
  }
}

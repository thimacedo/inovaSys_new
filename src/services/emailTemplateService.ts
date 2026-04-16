export interface EmailData {
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  cta_label?: string;
  cta_link?: string;
  camara_nome?: string;
}

export const emailTemplateService = {
  /**
   * Gera o HTML completo de um e-mail transacional.
   */
  build: (data: EmailData): string => {
    const primaryColor = '#0f172a';
    const accentColor = '#2563eb';
    const camara = data.camara_nome || 'InovaSys Legal Tech';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 0; }
          .wrapper { width: 100%; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background-color: ${primaryColor}; padding: 40px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; }
          .content { padding: 40px; line-height: 1.6; }
          .content h2 { color: ${primaryColor}; font-size: 20px; margin-top: 0; }
          .button-container { padding: 20px 0; text-align: center; }
          .button { background-color: ${accentColor}; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>${camara}</h1>
            </div>
            <div class="content">
              <h2>${data.titulo}</h2>
              ${data.subtitulo ? `<p style="font-weight: bold; color: #64748b;">${data.subtitulo}</p>` : ''}
              <p>${data.conteudo}</p>
              
              ${data.cta_link ? `
                <div class="button-container">
                  <a href="${data.cta_link}" class="button">${data.cta_label || 'Acessar Sistema'}</a>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Este é um e-mail automático enviado pela plataforma InovaSys.</p>
              <p>Por favor, não responda a este e-mail.</p>
              <p><strong>${camara}</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  templates: {
    novaMovimentacao: (processo: string, acao: string) => ({
      titulo: 'Nova Movimentação Processual',
      subtitulo: `Processo: ${processo}`,
      conteudo: `Informamos que houve uma nova atualização no seu processo: <strong>${acao}</strong>. Você pode conferir os detalhes e documentos anexados acessando sua área logada.`,
      cta_label: 'Ver Processo'
    }),
    assinaturaPendente: (docNome: string) => ({
      titulo: 'Assinatura Pendente',
      conteudo: `Um novo documento (<strong>${docNome}</strong>) foi gerado e requer sua assinatura digital para prosseguimento do rito arbitral.`,
      cta_label: 'Assinar Agora'
    }),
    faturaGerada: (valor: string, vencimento: string) => ({
      titulo: 'Fatura de Custas Gerada',
      conteudo: `A fatura referente às custas/honorários do processo foi emitida no valor de <strong>${valor}</strong> com vencimento para o dia <strong>${vencimento}</strong>.`,
      cta_label: 'Ver Financeiro'
    })
  }
};

export default emailTemplateService;

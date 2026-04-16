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
   * Em conformidade com o Pacto da Linguagem Simples do CNJ e LGPD.
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
          .footer { background-color: #f1f5f9; padding: 30px 40px; text-align: left; font-size: 11px; color: #64748b; border-t: 1px solid #e2e8f0; }
          .footer p { margin: 8px 0; line-height: 1.4; }
          .lgpd-badge { display: inline-block; padding: 2px 6px; background: #e2e8f0; border-radius: 4px; font-weight: bold; margin-bottom: 8px; }
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
              ${data.subtitulo ? `<p style="font-weight: bold; color: #64748b; margin-bottom: 20px;">${data.subtitulo}</p>` : ''}
              <div style="font-size: 16px; color: #475569;">
                ${data.conteudo}
              </div>
              
              ${data.cta_link ? `
                <div class="button-container">
                  <a href="${data.cta_link}" class="button">${data.cta_label || 'Acessar'}</a>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <div class="lgpd-badge">PRIVACIDADE E SEGURANÇA (LGPD)</div>
              <p>Este comunicado faz parte do rito oficial de arbitragem conduzido pela <strong>${camara}</strong> através da plataforma InovaSys.</p>
              <p>Tratamos seus dados pessoais apenas para cumprir obrigações legais e contratuais vinculadas ao seu processo. Para saber mais sobre como cuidamos das suas informações, consulte nossos termos de uso.</p>
              <p>© ${new Date().getFullYear()} ${camara}. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  templates: {
    novaMovimentacao: (processo: string, acao: string) => ({
      titulo: 'Seu processo teve uma nova movimentação',
      subtitulo: `Processo nº ${processo}`,
      conteudo: `Olá! Passando para avisar que aconteceu algo novo no seu processo: <br><br><strong>${acao}</strong>.<br><br>Você pode conferir todos os detalhes e documentos acessando sua conta agora mesmo.`,
      cta_label: 'Ver Detalhes'
    }),
    assinaturaPendente: (docNome: string) => ({
      titulo: 'Você precisa assinar um documento',
      conteudo: `Um novo documento (<strong>${docNome}</strong>) foi preparado e está aguardando sua assinatura digital para que o processo possa continuar.`,
      cta_label: 'Assinar Documento'
    }),
    faturaGerada: (valor: string, vencimento: string) => ({
      titulo: 'Fatura disponível para pagamento',
      conteudo: `A fatura referente às taxas do seu processo já está disponível. <br><br>Valor: <strong>${valor}</strong><br>Vencimento: <strong>${vencimento}</strong>.`,
      cta_label: 'Ver Fatura'
    })
  }
};

export default emailTemplateService;

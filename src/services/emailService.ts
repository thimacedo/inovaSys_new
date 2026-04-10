import logoImg from '../assets/logo-inovasys.png';

interface EmailTemplateProps {
  camaraNome: string;
  camaraLogo?: string;
  destinatario: string;
  assunto: string;
  corpo: string;
  linkAction?: { label: string; url: string };
}

export const emailService = {
  /**
   * Gera o HTML base para e-mails (Premium Design)
   */
  generateBaseTemplate: (props: EmailTemplateProps) => {
    const primaryColor = '#4f46e5'; // Indigo-600

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 40px 20px; text-align: center; }
          .header img { height: 40px; margin-bottom: 10px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 40px; }
          .content h2 { color: #1e293b; font-size: 24px; margin-top: 0; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .button { display: inline-block; padding: 14px 28px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
          .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${props.camaraLogo || logoImg}" alt="${props.camaraNome}">
            <h1>${props.camaraNome}</h1>
          </div>
          <div class="content">
            <h2>Olá, ${props.destinatario}!</h2>
            <p>${props.corpo}</p>
            ${props.linkAction ? `<a href="${props.linkAction.url}" class="button">${props.linkAction.label}</a>` : ''}
            <div class="divider"></div>
            <p style="font-size: 14px;">Este é um e-mail automático enviado pela plataforma InovaSys. Por favor, não responda diretamente a este endereço.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${props.camaraNome} • Processamento Arbitral Seguro
          </div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Simula o disparo de e-mail (Integração com API externa tipo SendGrid/Resend)
   */
  send: async (to: string, subject: string, html: string) => {
    console.log(`[EmailService] Disparando e-mail para ${to}: ${subject} (HTML Length: ${html.length})`);
    // No futuro: await supabase.functions.invoke('send-email', { body: { to, subject, html } });
    return new Promise(resolve => setTimeout(resolve, 1000));
  },

  /**
   * Templates Específicos
   */
  templates: {
    novoProcesso: (partNome: string, numProc: string, camaraNome: string) => ({
      assunto: `Novo Processo Arbitral: ${numProc}`,
      corpo: `Olá, ${partNome}. Um novo processo arbitral (nº ${numProc}) foi iniciado na <b>${camaraNome}</b> e você foi listado como parte interessada. Clique no botão abaixo para acessar os autos e manifestar-se.`,
      link: { label: 'Acessar Processo', url: '#' }
    }),
    agendamentoAudiencia: (partNome: string, numProc: string, data: string, hora: string) => ({
      assunto: `AUDIÊNCIA MARCADA - Processo ${numProc}`,
      corpo: `Olá, ${partNome}. Informamos que foi agendada uma audiência para o Processo nº ${numProc}. <br><br><b>Data:</b> ${data}<br><b>Hora:</b> ${hora}<br><br>Sua presença é fundamental para o andamento do rito arbitral.`,
      link: { label: 'Confirmar Presença', url: '#' }
    }),
    boasVindasGestor: (gestorEmail: string, senhaTemp: string, camaraNome: string) => ({
      assunto: `Seja Bem-vindo à InovaSys - Acesso à Câmara ${camaraNome}`,
      corpo: `Parabéns! A sua afiliação para a câmara <b>${camaraNome}</b> foi concluída com sucesso.<br><br><b>Dados de Acesso:</b><br>E-mail: ${gestorEmail}<br>Senha Temporária: <b style="color: #e11d48; font-family: monospace;">${senhaTemp}</b><br><br>Recomendamos que você altere sua senha no primeiro acesso para sua segurança.`,
      link: { label: 'Acessar Painel', url: 'https://inovasys-thimacedos-projects.vercel.app/' }
    })
  }
};

export default emailService;

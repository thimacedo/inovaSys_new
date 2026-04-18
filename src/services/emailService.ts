// src/services/emailService.ts

import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import { emailTemplateService } from './emailTemplateService';

interface TemplateData {
  [key: string]: string | number;
}

/**
 * Interpola os placeholders em uma string de template.
 * @param template A string com placeholders (ex: "Olá, {{nome}}!").
 * @param data Um objeto com os dados a serem inseridos.
 * @returns A string com os placeholders substituídos.
 */
function interpolateTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : placeholder;
  });
}

/**
 * Envia um e-mail customizado buscando um template pelo nome.
 * @param templateName O nome do template a ser usado.
 * @param organizationId O ID da organização para buscar o template correto.
 * @param recipientEmail O e-mail do destinatário.
 * @param data Os dados dinâmicos para preencher o template.
 */
export async function sendEmailFromTemplate(
  templateName: string,
  organizationId: string,
  recipientEmail: string,
  data: TemplateData
) {
  const emailRepo = DependencyRegistry.getEmailRepository();
  const camaraRepo = DependencyRegistry.getCamaraRepository();

  // 1. Buscar o template no banco de dados
  const template = await emailRepo.getTemplateByName(templateName, organizationId);
  if (!template) {
    throw new Error(`Template de e-mail "${templateName}" não encontrado.`);
  }

  // 2. Buscar dados da câmara para logo e nome
  const camara = await camaraRepo.getById(organizationId);

  // 3. Interpolar o template com os dados fornecidos
  const subject = interpolateTemplate(template.subject, data);
  const rawBody = interpolateTemplate(template.body_html, data);

  // 4. Envelopar no template padrão (Passo 9 Roadmap 3.0)
  const finalHtml = emailTemplateService.build({
    titulo: subject,
    conteudo: rawBody,
    camara_nome: camara?.nome || 'InovaSys',
    cta_link: data.cta_link as string,
    cta_label: data.cta_label as string
  });

  // 5. Chamar o endpoint da API para enviar o e-mail
  const response = await fetch('/api/vercel/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: recipientEmail,
      subject: subject,
      html: finalHtml,
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(`Falha ao enviar e-mail: ${errorResult.error || 'Erro desconhecido no servidor'}`);
  }

  return response.json();
}

/**
 * Legado/Compatibilidade: Envia e-mail direto com HTML.
 */
export async function send(to: string, subject: string, html: string) {
  const response = await fetch('/api/vercel/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!response.ok) throw new Error('Erro ao enviar e-mail');
  return response.json();
}

export const emailService = {
  sendEmailFromTemplate,
  send,
  generateBaseTemplate: (data: any) => emailTemplateService.build({
    titulo: data.assunto,
    conteudo: data.corpo,
    cta_link: data.linkAction,
    cta_label: 'Acessar'
  }),
  templates: {
    boasVindasGestor: (email: string, pass: string, nome: string) => ({
      assunto: `Bem-vindo ao InovaSys - ${nome}`,
      corpo: `Sua câmara foi registrada com sucesso. Acesse com seu e-mail ${email} e senha temporária: ${pass}`,
      link: 'https://inovasys.com.br/login'
    })
  }
};

export default emailService;

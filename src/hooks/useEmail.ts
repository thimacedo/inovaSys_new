// src/hooks/useEmail.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendEmailFromTemplate } from '../services/emailService';
import { toast } from 'sonner';

interface SendEmailOptions {
  templateName: string;
  organizationId: string;
  recipientEmail: string;
  data: { [key: string]: string | number };
}

export function useEmailSender() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (options: SendEmailOptions) =>
      sendEmailFromTemplate(
        options.templateName,
        options.organizationId,
        options.recipientEmail,
        options.data
      ),
    onSuccess: (result) => {
      toast.success('E-mail enviado com sucesso!');
      // Se houvesse uma lista de 'e-mails enviados', invalidaríamos aqui:
      // queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
      console.log('E-mail enviado:', result);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao enviar e-mail: ${error.message}`);
      console.error(error);
    },
  });

  return {
    sendEmail: mutation.mutate,
    isSending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}

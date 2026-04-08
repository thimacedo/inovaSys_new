export const whatsappService = {
  /**
   * Gera um link do WhatsApp com mensagem pré-preenchida.
   * @param phone Telefone formatado ou apenas números
   * @param message Texto da mensagem
   */
  getLink: (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(message);
    return `https://wa.me/55${cleanPhone}?text=${encodedMsg}`;
  },

  /**
   * Abre o WhatsApp em uma nova aba.
   */
  enviarMensagem: (phone: string, message: string) => {
    const link = whatsappService.getLink(phone, message);
    window.open(link, '_blank');
  },

  /**
   * Mensagens padronizadas para o fluxo do InovaSys.
   */
  templates: {
    notificacaoAudiencia: (partNome: string, numProc: string, data: string, hora: string, local: string) => {
      return `Olá, ${partNome}! Somos da Câmara de Arbitragem e informamos que foi agendada uma audiência para o Processo nº ${numProc}.\n\n📅 Data: ${data}\n🕒 Hora: ${hora}\n📍 Local: ${local}\n\nPor favor, confirme o recebimento desta mensagem.`;
    },
    avisoAndamento: (partNome: string, numProc: string, descricao: string) => {
      return `Olá, ${partNome}! Houve um novo andamento no seu Processo nº ${numProc}:\n\n"${descricao}"\n\nAcesse o sistema para mais detalhes.`;
    }
  }
};

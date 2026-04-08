/**
 * Serviço de Integração com Agendas Externas
 * Gera links universais para Google Calendar e Outlook.
 */
export const calendarService = {
  /**
   * Gera um link para adicionar um evento ao Google Calendar.
   */
  generateGoogleLink: (title: string, date: string, description: string) => {
    const start = new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
    
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: title,
      dates: `${start}/${end}`,
      details: description,
      sf: 'true',
      output: 'xml'
    });

    return `${baseUrl}&${params.toString()}`;
  },

  /**
   * Gera um link para adicionar ao Outlook/Office 365.
   */
  generateOutlookLink: (title: string, date: string, description: string) => {
    const start = new Date(date).toISOString();
    const end = new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString();
    
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';
    const params = new URLSearchParams({
      subject: title,
      startdt: start,
      enddt: end,
      body: description,
      allday: 'false'
    });

    return `${baseUrl}&${params.toString()}`;
  }
};

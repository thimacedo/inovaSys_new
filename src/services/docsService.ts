/**
 * 📚 DOCS SERVICE - Motor de Documentação Dinâmica
 * Gerencia o carregamento de arquivos Markdown locais para o Microfrontend /docs.
 */

export const docsService = {
  /**
   * Lista todos os manuais disponíveis e seus metadados.
   */
  getAvailableDocs: () => {
    return [
      { id: 'onboarding', label: 'Guia de Início', category: 'Geral', icon: 'info' },
      { id: 'diretrizes_ia', label: 'Diretrizes de IA', category: 'Compliance', icon: 'shield' },
      { id: 'api_tecnica', label: 'Documentação API', category: 'Técnico', icon: 'code' },
      { id: 'faq', label: 'Dúvidas Frequentes', category: 'Suporte', icon: 'help' },
    ];
  },

  /**
   * Carrega o conteúdo de um arquivo Markdown específico.
   */
  loadDocContent: async (id: string): Promise<string> => {
    try {
      // Em desenvolvimento e produção, buscamos o arquivo MD na pasta de assets/content
      const response = await fetch(`/src/presentation/pages/Docs/content/${id}.md`);
      
      if (!response.ok) {
        throw new Error('Arquivo não encontrado');
      }

      return await response.text();
    } catch (e) {
      console.error('Erro ao carregar documento:', e);
      return '# Documento não disponível\nDesculpe, o conteúdo solicitado ainda não está disponível ou foi movido.';
    }
  }
};

export default docsService;

/**
 * Serviço de Gerenciamento de Notificações Push
 */
export const pushService = {
  /**
   * Solicita permissão ao usuário e registra o Service Worker
   */
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await pushService.registerServiceWorker();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erro ao pedir permissão para notificações:', e);
      return false;
    }
  },

  /**
   * Registra o SW na página
   */
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[Push Service] SW registrado com sucesso:', registration.scope);
        return registration;
      } catch (err) {
        console.error('[Push Service] Falha ao registrar SW:', err);
      }
    }
  },

  /**
   * Envia uma notificação local (para teste)
   */
  sendLocalTest: async (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        registration.showNotification(title, {
          body: body,
          icon: '/logo-inovasys.png',
          badge: '/logo-inovasys.png'
        });
      } else {
        new Notification(title, { body });
      }
    }
  }
};

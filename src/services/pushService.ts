import { supabase } from '../lib/supabase';

/**
 * Serviço de Gerenciamento de Notificações Push (PWA)
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
        const registration = await pushService.registerServiceWorker();
        if (registration) {
          await pushService.subscribeUser(registration);
        }
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
    return null;
  },

  /**
   * Inscreve o usuário para Push real via Servidor
   */
  subscribeUser: async (registration: ServiceWorkerRegistration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // No futuro, adicionar publicVapidKey aqui
        // applicationServerKey: '...' 
      });

      // Salva no banco de dados
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          subscription_json: subscription,
          device_type: window.innerWidth < 1024 ? 'mobile' : 'desktop'
        });

      if (error && error.code !== '23505') { // Ignora se já existir
        console.warn('[Push Service] Falha ao salvar subscrição:', error);
      }
    } catch (error) {
      console.error('[Push Service] Falha ao subscrever usuário:', error);
    }
  },

  /**
   * Envia uma notificação local (para teste) garantindo que o SW está pronto
   */
  sendLocalTest: async (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          await registration.showNotification(title, {
            body: body,
            icon: '/logo-inovasys.png',
            badge: '/logo-inovasys.png',
            vibrate: [100, 50, 100]
          } as any);
        }
      } catch (error) {
        new Notification(title, { body });
      }
    }
  }
};

export default pushService;


/**
 * InovaSys Service Worker (PWA)
 * v1.0.0 - Suporte a Notificações Push e Offline Basico
 */

const CACHE_NAME = 'inovasys-cache-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado');
});

// Captura de notificações push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização no seu processo.',
    icon: '/logo-inovasys.png', // Certifique-on de que a logo existe em public/
    badge: '/logo-inovasys.png',
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ver Agora' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'InovaSys Alerta', options)
  );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryProvider } from './presentation/providers/QueryProvider';
import { ModalProvider } from './context/ModalContext.tsx';
import { validateEnv } from './utils/env.ts';

// Validação de segurança em Runtime
validateEnv();

// Auto-recuperação contra cache zumbi e 404 em Chunks dinâmicos
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite: Módulo desatualizado detectado. Forçando Hard Reload para buscar nova versão no Vercel...');
  window.location.reload();
});

// Rotina de expurgo de Service Workers legados (Evita cache zumbi)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(
        (boolean) => boolean && console.log('Service Worker legado desregistrado com sucesso.')
      );
    }
  }).catch(err => console.error('Erro ao verificar Service Workers:', err));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </QueryProvider>
  </React.StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryProvider } from './presentation/providers/QueryProvider';
import { ModalProvider } from './context/ModalContext.tsx';
import { validateEnv } from './utils/env.ts';
import { ErrorBoundary } from './components/ErrorBoundary';

// Validação de segurança em Runtime
// Removida a chamada de topo de nível para evitar crash antes do ErrorBoundary carregar.
// A validação agora ocorre dentro do ValidateEnvWrapper.

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
    <ErrorBoundary>
      {/* Movendo a validação para dentro do ErrorBoundary via um componente wrapper */}
      <ValidateEnvWrapper>
        <QueryProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </QueryProvider>
      </ValidateEnvWrapper>
    </ErrorBoundary>
  </React.StrictMode>,
);

function ValidateEnvWrapper({ children }: { children: React.ReactNode }) {
  // Executa a validação apenas uma vez no mount do componente
  React.useLayoutEffect(() => {
    try {
      validateEnv();
    } catch (e) {
      console.error('ValidateEnvWrapper caught error:', e);
      throw e; // Relançar para o ErrorBoundary
    }
  }, []);

  return <>{children}</>;
}

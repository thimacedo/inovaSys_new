import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary capturou erro não tratado:', error);
    console.error('📋 Stack trace:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '700px',
            width: '100%',
            backgroundColor: '#16213e',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e94560'
          }}>
            <h1 style={{ color: '#e94560', marginBottom: '1.5rem' }}>⚠️ Erro na Aplicação</h1>
            <p style={{ marginBottom: '1rem' }}>Ocorreu um erro não esperado que impediu o carregamento da aplicação.</p>
            
            <div style={{
              backgroundColor: '#0f3460',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.message}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>📝 O que fazer:</h3>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Abra o Console do Navegador (F12)</li>
                <li>Copie a mensagem de erro completa</li>
                <li>Informe para o time de desenvolvimento</li>
                <li>Tente recarregar a página</li>
              </ol>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e94560',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
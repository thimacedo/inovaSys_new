import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Escudo de Proteção Global (Error Boundary) - InovaSys 2.0
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Erro inesperado' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Proteção InovaSys] Erro capturado:', error, errorInfo);
  }

  render() {
    const { hasError, errorMessage } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' }}>
          <div style={{ padding: '40px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '16px' }}>Falha Crítica no Sistema</h2>
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '24px' }}>{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }
    return children;
  }
}

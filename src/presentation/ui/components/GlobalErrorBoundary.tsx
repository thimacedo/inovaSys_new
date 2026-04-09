import React from 'react';

/**
 * Escudo de Proteção Global (Error Boundary) - InovaSys 2.0
 * Forçado com tipagem dinâmica para garantir build em ambientes TS 5.8+ com React 19.
 */
// @ts-ignore
export class GlobalErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMessage: error.message || 'Erro inesperado' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[Proteção InovaSys] Erro capturado:', error, errorInfo);
  }

  render() {
    const s = (this as any).state;
    const p = (this as any).props;

    if (s.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' }}>
          <div style={{ padding: '40px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '16px' }}>Falha Crítica no Sistema</h2>
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '24px' }}>{s.errorMessage}</p>
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
    return p.children;
  }
}

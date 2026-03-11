'use client';

import dynamic from 'next/dynamic';
import React, { Component } from 'react';

// Error Boundary para capturar erros do lado do cliente
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#000', color: 'red', minHeight: '100vh' }}>
          <h1>Algo deu errado.</h1>
          <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', marginTop: '20px' }}>
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ClientPage = dynamic(() => import('./ClientPage'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Carregando App...</div>
});

export default function Page() {
  return (
    <ErrorBoundary>
      <ClientPage />
    </ErrorBoundary>
  );
}

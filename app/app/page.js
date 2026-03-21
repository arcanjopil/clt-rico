'use client';

import dynamic from 'next/dynamic';
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#000', color: 'red', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Algo deu errado no cliente.</h1>
          <p>Erro capturado:</p>
          <pre style={{ overflow: 'auto', maxHeight: '400px', backgroundColor: '#111', padding: '10px', borderRadius: '5px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ClientPage = dynamic(() => import('../ClientPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold mb-2">Carregando App...</h2>
      <p className="text-gray-400 text-sm mb-8">Isso pode levar alguns segundos.</p>

      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
      >
        Recarregar Página
      </button>
    </div>
  ),
});

export default function Page() {
  return (
    <ErrorBoundary>
      <ClientPage />
    </ErrorBoundary>
  );
}


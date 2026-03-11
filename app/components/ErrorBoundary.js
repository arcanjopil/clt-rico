'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
          <h1 className="text-red-500 text-2xl mb-4">Something went wrong.</h1>
          <div className="bg-gray-900 p-4 rounded overflow-auto mb-4">
            <p className="text-red-300 font-bold">{this.state.error && this.state.error.toString()}</p>
          </div>
          <details className="whitespace-pre-wrap text-xs text-gray-500">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

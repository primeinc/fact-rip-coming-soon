import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FACT.RIP] Error caught:', error, errorInfo);
    
    // Send error telemetry if endpoint available
    if (import.meta.env.VITE_TELEMETRY_ENDPOINT) {
      fetch(import.meta.env.VITE_TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'error_boundary',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            The Loop Fractures
          </h1>
          <p className="text-gray-300 mb-6 max-w-md text-center">
            An unexpected error has interrupted the surveillance. 
            The memory persists, but observation has paused.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            Resume Observation
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  reportSent: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    reportSent: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId, reportSent: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      url: window.location.href
    };
    
    console.error('[FACT.RIP] Error caught:', errorReport);
    
    // Send error telemetry if endpoint available
    if (import.meta.env.VITE_TELEMETRY_ENDPOINT) {
      fetch(import.meta.env.VITE_TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'error_boundary',
          ...errorReport
        })
      }).catch(() => {});
    }
    
    // Store error locally for recovery
    try {
      localStorage.setItem('fact.rip.lastError', JSON.stringify(errorReport));
    } catch {
      // Storage might be full or disabled
    }
  }
  
  private handleSendReport = async () => {
    const { error, errorId } = this.state;
    
    if (!error || !errorId) return;
    
    try {
      // In production, this would send to your error reporting service
      const reportEndpoint = import.meta.env.VITE_ERROR_REPORT_ENDPOINT;
      
      if (reportEndpoint) {
        await fetch(reportEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorId,
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });
      }
      
      this.setState({ reportSent: true });
    } catch (e) {
      console.error('Failed to send error report:', e);
    }
  };
  
  private handleRecovery = () => {
    // Clear error state from storage
    try {
      localStorage.removeItem('fact.rip.lastError');
    } catch {
      // Ignore storage errors
    }
    
    // Reload the page
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorId, reportSent } = this.state;
      
      return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            The Loop Fractures
          </h1>
          <p className="text-gray-300 mb-6 max-w-md text-center">
            An unexpected error has interrupted the surveillance. 
            The memory persists, but observation has paused.
          </p>
          
          {errorId && (
            <p className="text-xs text-gray-500 mb-4 font-mono">
              Error ID: {errorId}
            </p>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={this.handleRecovery}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              Resume Observation
            </button>
            
            {import.meta.env.VITE_ERROR_REPORT_ENDPOINT && (
              <button
                onClick={this.handleSendReport}
                disabled={reportSent}
                className={`px-6 py-3 border border-red-600 rounded-full transition-colors ${
                  reportSent 
                    ? 'text-gray-500 border-gray-500 cursor-not-allowed' 
                    : 'text-red-500 hover:bg-red-600/10'
                }`}
              >
                {reportSent ? 'Report Sent' : 'Send Report'}
              </button>
            )}
          </div>
          
          {import.meta.env.DEV && error && (
            <details className="mt-8 max-w-2xl">
              <summary className="cursor-pointer text-gray-400">
                Developer Details
              </summary>
              <pre className="mt-4 p-4 bg-gray-900 rounded text-xs overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </main>
      );
    }

    return this.props.children;
  }
}
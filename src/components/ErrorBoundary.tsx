import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BRANDING } from '../config/branding';
import { emergencyStorage } from '../utils/emergency-storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  reportSent: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorId: null,
    reportSent: false
  };
  
  static getDerivedStateFromError(error: Error): State {
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      reportSent: false
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    // Build comprehensive error report
    const errorReport = {
      errorId,
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
    
    // Store error using emergency storage (only allowed place)
    emergencyStorage.setError({
      message: error.message,
      stack: error.stack || '',
      id: errorId || ''
    });
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
    // Clear error state from emergency storage
    emergencyStorage.clearError();
    
    // Reload the page
    window.location.reload();
  };
  
  render() {
    const { hasError, error, reportSent } = this.state;
    const { children } = this.props;
    
    if (hasError && error) {
      return (
        <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center space-y-6">
            <h1 className="text-3xl font-mono mb-4">
              {BRANDING.copy.error.title}
            </h1>
            
            <div className="space-y-4 text-red-400">
              <p className="font-mono">{BRANDING.copy.error.body}</p>
              
              <div className="bg-red-950/30 border border-red-800 rounded p-4 text-left">
                <code className="text-xs block overflow-auto">
                  {error.message}
                </code>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={this.handleRecovery}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-mono text-sm"
                >
                  {BRANDING.copy.error.resume}
                </button>
                
                {import.meta.env.VITE_ERROR_REPORT_ENDPOINT && !reportSent && (
                  <button
                    onClick={this.handleSendReport}
                    className="px-6 py-3 bg-red-900 hover:bg-red-800 text-red-100 rounded transition-colors font-mono text-sm"
                  >
                    {BRANDING.copy.error.report}
                  </button>
                )}
                
                {reportSent && (
                  <p className="text-red-400 font-mono text-sm">
                    {BRANDING.copy.error.reported}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return children;
  }
}

export default ErrorBoundary;
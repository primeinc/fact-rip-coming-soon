import { useCallback } from 'react';

interface TelemetryEvent {
  action: string;
  timestamp: string;
  [key: string]: unknown;
}

export function useTelemetry() {
  const sendEvent = useCallback(async (event: TelemetryEvent) => {
    // Check for E2E test mock first, then environment variable
    const endpoint = (window as unknown as { __VITE_TELEMETRY_ENDPOINT__?: string }).__VITE_TELEMETRY_ENDPOINT__ || import.meta.env.VITE_TELEMETRY_ENDPOINT;
    
    if (!endpoint) {
      console.log('[Telemetry]', event);
      return;
    }

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('[Telemetry] Failed to send:', error);
      console.log('[Telemetry] Fallback:', event);
    }
  }, []);

  return { sendEvent };
}
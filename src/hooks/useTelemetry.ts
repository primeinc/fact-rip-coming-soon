import { useCallback } from 'react';

interface TelemetryEvent {
  action: string;
  timestamp: string;
  [key: string]: unknown;
}

export function useTelemetry() {
  const sendEvent = useCallback(async (event: TelemetryEvent) => {
    const endpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT;
    
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
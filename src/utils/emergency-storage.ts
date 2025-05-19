/**
 * Emergency storage for error boundary
 * This is the ONLY place outside storage-adapter that can access localStorage
 * Used when React context is unavailable (error boundary above providers)
 */

const EMERGENCY_STORAGE_KEY = 'fact.rip.emergency';

export const emergencyStorage = {
  setError(error: { message: string; stack?: string; id: string }) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify({
          ...error,
          timestamp: Date.now()
        }));
      }
    } catch {
      // Fail silently - this is emergency storage
    }
  },
  
  getError(): { message: string; stack?: string; id: string } | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(EMERGENCY_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
      }
    } catch {
      // Fail silently
    }
    return null;
  },
  
  clearError() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(EMERGENCY_STORAGE_KEY);
      }
    } catch {
      // Fail silently
    }
  }
};
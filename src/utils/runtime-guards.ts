// Runtime guards to catch architectural violations in development

// Only enable guards in development, not during tests
const STORAGE_GUARD_ENABLED = import.meta.env.DEV && !('__playwright_test__' in window);

export function installStorageGuards() {
  if (!STORAGE_GUARD_ENABLED) return;

  // Monkey-patch localStorage/sessionStorage in development
  const originalLocalStorage = window.localStorage;
  const originalSessionStorage = window.sessionStorage;

  const createStorageProxy = (storage: Storage, name: string) => {
    return new Proxy(storage, {
      get(target, prop) {
        // Allow access from test utilities and allowed modules
        const stack = new Error().stack || '';
        const isTestUtil = stack.includes('test-utils');
        const isStorageAdapter = stack.includes('storage-adapter');
        const isStorageUtil = stack.includes('storage.ts');
        const isStorageContext = stack.includes('StorageContext');
        const isEmergencyStorage = stack.includes('emergency-storage');

        if (isTestUtil || isStorageAdapter || isStorageUtil || isStorageContext || isEmergencyStorage) {
          return target[prop as keyof Storage];
        }

        // Throw error in development to fail fast
        const error = new Error(
          `🚨 Direct ${name} access detected! Use StorageContext instead.\n\nStack trace:\n${stack}`
        );

        // Log before throwing for visibility
        console.error(error.message);
        throw error;

        // Return the original function but log the violation
        const value = target[prop as keyof Storage];
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    });
  };

  // Replace global storage objects with proxies
  Object.defineProperty(window, 'localStorage', {
    get: () => createStorageProxy(originalLocalStorage, 'localStorage'),
    configurable: true
  });

  Object.defineProperty(window, 'sessionStorage', {
    get: () => createStorageProxy(originalSessionStorage, 'sessionStorage'),
    configurable: true
  });
}
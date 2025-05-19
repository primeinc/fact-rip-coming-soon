// This is a factory function that creates storage utilities for a given adapter
export function createStorage(adapter: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}) {
  return {
    get: (key: string): string | null => {
      try {
        return adapter.getItem(key);
      } catch (error) {
        console.warn(`Failed to get ${key} from storage:`, error);
        return null;
      }
    },
    
    set: (key: string, value: string): boolean => {
      try {
        adapter.setItem(key, value);
        return true;
      } catch (error) {
        console.error(`Failed to set ${key} in storage:`, error);
        return false;
      }
    },
    
    remove: (key: string): boolean => {
      try {
        adapter.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Failed to remove ${key} from storage:`, error);
        return false;
      }
    },
    
    clear: (): boolean => {
      try {
        adapter.clear();
        return true;
      } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
      }
    }
  };
}
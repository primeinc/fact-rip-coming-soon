export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in environments where localStorage is blocked
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // Silently fail
    }
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map();

  constructor(initialData?: Record<string, string>) {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.store.set(key, value);
      });
    }
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
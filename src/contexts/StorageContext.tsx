/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { LocalStorageAdapter, MemoryStorageAdapter } from '../utils/storage-adapter';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

interface StorageContextType {
  adapter: StorageAdapter;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function useStorageAdapter() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageAdapter must be used within StorageProvider');
  }
  return context.adapter;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}

interface StorageProviderProps {
  children: ReactNode;
  adapter?: StorageAdapter;
}

export function StorageProvider({ children, adapter }: StorageProviderProps) {
  // If no adapter is provided, create a default one
  const storageAdapter = adapter || (() => {
    try {
      // Test if localStorage is available
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return new LocalStorageAdapter();
    } catch {
      // Fall back to memory storage
      return new MemoryStorageAdapter();
    }
  })();

  return (
    <StorageContext.Provider value={{ adapter: storageAdapter }}>
      {children}
    </StorageContext.Provider>
  );
}
import { useState, useEffect } from 'react';
import { useStorageAdapter } from '../contexts/StorageContext';
import { createStorage } from '../utils/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const adapter = useStorageAdapter();
  const storage = createStorage(adapter);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storage.get(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    }
    return initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    if (value === null || value === undefined) {
      storage.remove(key);
    } else {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      storage.set(key, serialized);
    }
  };

  const removeValue = () => {
    setStoredValue(initialValue);
    storage.remove(key);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue as T);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
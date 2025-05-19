import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { StorageProvider } from '../contexts/StorageContext';
import { MemoryStorageAdapter } from '../utils/storage-adapter';
import { type ReactNode } from 'react';

describe('useLocalStorage', () => {
  let adapter: MemoryStorageAdapter;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
  });

  const createWrapper = (adapter: MemoryStorageAdapter) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <StorageProvider adapter={adapter}>{children}</StorageProvider>;
    };
  };

  it('should initialize with default value', () => {
    const { result } = renderHook(
      () => useLocalStorage('testKey', 'defaultValue'),
      { wrapper: createWrapper(adapter) }
    );
    expect(result.current[0]).toBe('defaultValue');
  });

  it('should read existing value from storage', () => {
    adapter.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(
      () => useLocalStorage('testKey', 'defaultValue'),
      { wrapper: createWrapper(adapter) }
    );
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update value in storage', () => {
    const { result } = renderHook(
      () => useLocalStorage('testKey', 'initial'),
      { wrapper: createWrapper(adapter) }
    );
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(adapter.getItem('testKey')).toBe('updated');
  });

  it('should remove value from storage', () => {
    adapter.setItem('testKey', JSON.stringify('value'));
    const { result } = renderHook(
      () => useLocalStorage('testKey', 'default'),
      { wrapper: createWrapper(adapter) }
    );
    
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('default');
    expect(adapter.getItem('testKey')).toBeNull();
  });

  it('should handle non-JSON strings', () => {
    adapter.setItem('testKey', 'plainString');
    const { result } = renderHook(
      () => useLocalStorage<string>('testKey', 'default'),
      { wrapper: createWrapper(adapter) }
    );
    expect(result.current[0]).toBe('plainString');
  });
});
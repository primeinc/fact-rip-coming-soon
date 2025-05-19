import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('defaultValue');
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('testKey')).toBe('updated');
  });

  it('should remove value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('value'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('testKey')).toBeNull();
  });

  it('should handle non-JSON strings', () => {
    localStorage.setItem('testKey', 'plainString');
    const { result } = renderHook(() => useLocalStorage<string>('testKey', 'default'));
    expect(result.current[0]).toBe('plainString');
  });
});
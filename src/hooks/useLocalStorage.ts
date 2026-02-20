import { useCallback, useState } from 'react';
const PREFIX = 'displaylab::';
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  if (!key.startsWith(PREFIX)) throw new Error(`useLocalStorage key must start with "${PREFIX}": ${key}`);
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? defaultValue : (JSON.parse(raw) as T);
    } catch {
      return defaultValue;
    }
  });
  const setStoredValue = useCallback((next: T) => {
    setValue(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch { /* localStorage may be unavailable */ }
  }, [key]);
  return [value, setStoredValue];
}

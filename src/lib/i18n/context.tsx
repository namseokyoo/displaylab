/**
 * i18n Context
 *
 * Self-implemented internationalization for Display Lab.
 * Follows the ThemeContext pattern: createContext + Provider + useTranslation hook.
 *
 * - localStorage persistence at `displaylab::settings::language`
 * - Browser language auto-detection via navigator.language
 * - Dot-notation key resolution (e.g. "home.hero.title")
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from './types';
import en from './translations/en';
import ko from './translations/ko';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'displaylab::settings::language';

const translations: Record<Locale, Record<string, unknown>> = { en, ko };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitialLocale(): Locale {
  // 1. Check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ko') return stored;
  } catch {
    // localStorage might be unavailable
  }

  // 2. Check browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.startsWith('ko')) return 'ko';
  }

  // 3. Default to English
  return 'en';
}

/**
 * Resolve a dot-notation key against a nested translation object.
 * e.g. resolve("home.hero.title", en) => en.home.hero.title
 */
function resolve(key: string, obj: Record<string, unknown>): string {
  const parts = key.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return key; // fallback: return the key itself
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'string') return current;
  return key; // fallback: return the key itself
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const I18nContext = createContext<I18nContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage might be unavailable
    }
    // Update html lang attribute
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return resolve(key, translations[locale] as Record<string, unknown>);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
}

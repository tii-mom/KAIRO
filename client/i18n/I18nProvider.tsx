import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Locale, TranslationValue } from './types';
import { messages } from './locales';

export interface I18nContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tArray: (key: string, params?: Record<string, string | number>) => string[];
}

export const I18nContext = createContext<I18nContextProps | undefined>(undefined);

function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('kairo.locale');
    if (saved === 'en-US' || saved === 'zh-CN' || saved === 'ko-KR') {
      return saved as Locale;
    }
    
    // Check browser navigator language
    const navLang = navigator.language || '';
    if (navLang.toLowerCase().startsWith('zh')) {
      return 'zh-CN';
    }
    if (navLang.toLowerCase().startsWith('ko')) {
      return 'ko-KR';
    }
    return 'en-US';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('kairo.locale', newLocale);
  };

  const interpolate = (value: string, params?: Record<string, string | number>): string => {
    if (!params) return value;
    let res = value;
    Object.entries(params).forEach(([k, v]) => {
      res = res.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    return res;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let val = getNestedValue(messages[locale], key);
    if (val === undefined) {
      console.warn(`[i18n] Key not found in current locale "${locale}": ${key}`);
      val = getNestedValue(messages['en-US'], key);
      if (val === undefined) {
        console.warn(`[i18n] Key not found in fallback en-US: ${key}`);
        return key;
      }
    }

    if (Array.isArray(val)) {
      return val.map((v) => interpolate(v, params)).join('\n');
    }
    if (typeof val === 'string') {
      return interpolate(val, params);
    }
    return key;
  };

  const tArray = (key: string, params?: Record<string, string | number>): string[] => {
    let val = getNestedValue(messages[locale], key);
    if (val === undefined) {
      console.warn(`[i18n] Array key not found in current locale "${locale}": ${key}`);
      val = getNestedValue(messages['en-US'], key);
      if (val === undefined) {
        console.warn(`[i18n] Array key not found in fallback en-US: ${key}`);
        return [key];
      }
    }

    if (Array.isArray(val)) {
      return val.map((v) => interpolate(v, params));
    }
    if (typeof val === 'string') {
      return [interpolate(val, params)];
    }
    return [key];
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tArray }}>
      {children}
    </I18nContext.Provider>
  );
}

'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import all language files
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import pt from '@/messages/pt.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';

type Language = 'en' | 'es' | 'pt' | 'fr' | 'de';
type TranslationData = typeof en;

// For now, use English translations as fallback for all languages
const translations: Record<Language, TranslationData> = {
  en,
  es: en,  // TODO: Replace with actual Spanish translations
  pt: en,  // TODO: Replace with actual Portuguese translations
  fr: en,  // TODO: Replace with actual French translations
  de: en,  // TODO: Replace with actual German translations
};

export type TranslationNamespace = keyof TranslationData;
type TranslationKey<N extends TranslationNamespace> = keyof TranslationData[N];

export function useTranslation(namespace: TranslationNamespace) {
  const { language } = useLanguage();

  const t = useCallback(<T extends Record<string, unknown> = Record<string, string>>(
    key: string,
    params?: T
  ): string => {
    const keys = key.split('.');
    let value = translations[language as Language][namespace];
    
    for (const k of keys) {
      value = value?.[k as keyof typeof value];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation not found for key: ${key} in namespace: ${namespace}`);
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc: string, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }
    
    return value;
  }, [language, namespace]);

  return t;
}
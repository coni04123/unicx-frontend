'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  // { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  // { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  // { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  // { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && languages.find(l => l.code === savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // In the future, also sync with backend API
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}



import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { enTranslations } from '@/translations/en';
import { heTranslations } from '@/translations/he';
import { ruTranslations } from '@/translations/ru';

// Define available languages
export type Language = 'en' | 'he' | 'ru';

// Define language direction
export type Direction = 'ltr' | 'rtl';

// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: Direction;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  he: heTranslations,
  ru: ruTranslations,
};

// Language directions
const directions: Record<Language, Direction> = {
  en: 'ltr',
  ru: 'ltr',
  he: 'rtl',
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get saved language from localStorage or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  // Update language and store in localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction
    document.documentElement.dir = directions[lang];
    document.documentElement.lang = lang;
  };

  // Set initial document direction
  useEffect(() => {
    document.documentElement.dir = directions[language];
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        t,
        direction: directions[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
